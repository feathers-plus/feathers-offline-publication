
const assert = require('chai').assert;
const EventEmitter = require('events');
const socketio = require('feathers-socketio');

const feathers = require('feathers');
const memory = require('feathers-memory');
const hooks = require('feathers-hooks');
const { stashBefore, debug } = require('feathers-hooks-common');


const { clientConfigure, clientTest } = require('./helpers/client');
const commonPublications = require('../src/common-publications');
const serverPublications = require('../src/server');

class MyEmitter extends EventEmitter {}

describe('filter', () => {
  let myEmitter;
  let app;
  let server;
  let feathersClient;
  let events;
  let messagesClient;
  let messagesServer;
  let eventsLeft;
  
  beforeEach(done => {
    myEmitter = new MyEmitter();
    events = [];
    
    // configure Feathers on server
    app = feathers()
      .configure(hooks())
      .configure(socketio())
      .configure(services1);
    
    // start server
    server = app.listen(3030);
    server.on('listening', () => {
      
      // configure server publications support
      serverPublications(app, commonPublications, 'messages');
  
      // configure Feathers on client
      feathersClient = clientConfigure();
      
      // get services
      messagesClient = feathersClient.service('messages');
      messagesServer = app.service('messages');
      
      // accumulate events
      ['created', 'updated', 'patched', 'removed'].forEach(name => {
        messagesClient.on(name, eventHandler(name));
      });
      
      function eventHandler(name) {
        return data => {
          events.push({ name, data });
          
          // handle unexpected event
          if (eventsLeft < 0) {
            assert(false, 'unexpected extra event occurred');
          }
          
          // signal all expected events have occurred
          if (--eventsLeft === 0) {
            myEmitter.emit('_this_test', true);
          }
        }
      }
      
      // event signals end of publication creation
      feathersClient.io.on('_testing', () => {
        done();
      });
      
      // create publication on client
      clientTest((feathersClient, publicationClient) => {
        return publicationClient.addPublication(feathersClient, 'messages', {
          module: commonPublications,
          name: 'query',
          params: { dept: 'acct' },
        });
      });
    });
  });
  
  afterEach(() => {
    server.close();
  });

  it('filters create on server', done => {
    eventsLeft = 1;
  
    myEmitter.on('_this_test', () => {
      assert.deepEqual(events, [
        { name: 'created', data: { name: 'john', dept: 'acct', id: 1 } }
      ]);
      
      done();
    });
  
    messagesServer.create({ name: 'nick', dept: 'xacct' })
      .then(() => {
        return messagesServer.create({ name: 'john', dept: 'acct' });
      });
  });
  
  it('filters create on client', done => {
    eventsLeft = 1;
    
    myEmitter.on('_this_test', () => {
      assert.deepEqual(events, [
        { name: 'created', data: { name: 'john', dept: 'acct', id: 1 } }
      ]);
      
      done();
    });
    
    messagesClient.create({ name: 'nick', dept: 'xacct' })
      .then(() => {
        return messagesClient.create({ name: 'john', dept: 'acct' });
      });
  });
  
  it('filters mutations entering publication', done => {
    eventsLeft = 1;
    
    myEmitter.on('_this_test', () => {
      assert.deepEqual(events, [
        { name: 'patched', data: { name: 'nick', dept: 'acct', id: 0 } }
      ]);
      
      done();
    });
  
    messagesClient.create({ name: 'nick', dept: 'xacct' })
      .then(() => {
        return messagesServer.patch(0, { dept: 'acct' });
      });
  });
  
  it('filters mutations leaving publication', done => {
    eventsLeft = 2;
    
    myEmitter.on('_this_test', () => {
      assert.deepEqual(events, [
        { name: 'created', data: { name: 'john', dept: 'acct', id: 0 } },
        { name: 'patched', data: { name: 'john', dept: 'xacct', id: 0 } }
      ]);
      
      done();
    });
    
    messagesClient.create({ name: 'john', dept: 'acct' })
      .then(data => {
        return messagesServer.patch(0, { dept: 'xacct' });
      });
  });
  
  it('filters removes', done => {
    eventsLeft = 2;
    
    myEmitter.on('_this_test', () => {
      assert.deepEqual(events, [
        { name: 'created', data: { name: 'john', dept: 'acct', id: 0 } },
        { name: 'removed', data: { name: 'john', dept: 'acct', id: 0 } },
      ]);
      
      done();
    });
    
    messagesClient.create({ name: 'john', dept: 'acct' })
      .then(() => {
        return messagesClient.create({ name: 'nick', dept: 'xacct' })
      })
      .then(() => {
        return messagesClient.remove(1)
      })
      .then(() => {
        return messagesClient.remove(0)
      });
  });
  
  it('ignores records not in the publication', done => {
    eventsLeft = 1;
    
    myEmitter.on('_this_test', () => {
      assert.deepEqual(events, [
        { name: 'created', data: { name: 'john', dept: 'acct', id: 1 } },
      ]);
      
      done();
    });
    
    messagesClient.create({ name: 'nick', dept: 'xacct' })
      .then(() => {
        return messagesClient.update(0, { name: 'jane', dept: 'xacct' })
      })
      .then(() => {
        return messagesClient.patch(0, { name: 'july' })
      })
      .then(() => {
        return messagesClient.remove(0)
      })
      .then(() => {
        return messagesClient.create({ name: 'john', dept: 'acct' })
      });
  });
});

// Helpers

function services1 () {
  const app = this;
  app.configure(messages)
}

function messages () {
  const app = this;
  app.use('/messages', memory({}));
  
  app.service('messages').hooks({
    before: {
      update: stashBefore(),
      patch: stashBefore(),
      remove: stashBefore(),
    }
  })
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
