
const assert = require('chai').assert;
const feathers = require('feathers');
const memory = require('feathers-memory');
const hooks = require('feathers-hooks');
const socketio = require('feathers-socketio');

const { clientConfigure, clientTest } = require('./helpers/client');
const serverConfigure = require('../src/server/configure');

const publications = {
  truthy: () => data => true,
  falsey: () => data => false,
};

function services1 () {
  const app = this;
  app.configure(messages)
}

function messages () {
  const app = this;
  app.use('/messages', memory({}));
}

describe('server-manual', () => {
  let app;
  let server;
  let feathersClient;
  
  beforeEach(done => {
    // configure server Feathers
    app = feathers()
      .configure(hooks())
      .configure(socketio())
      .configure(services1);
    
    // start server
    server = app.listen(3030);
    server.on('listening', () => {
      
      // configure server publications support
      serverConfigure(app, publications);
  
      // configure client Feathers
      feathersClient = clientConfigure();
      
      done();
    });
  });
  
  afterEach(() => {
    server.close();
  });
  
  it('adds publication', done => {
    // event signals end of processing
    feathersClient.io.on('_testing', data => {
  
      assert.deepEqual(data, {
        source: 'addPublication',
        serviceName: 'messages',
        name: 'truthy',
        params: [ 1, 2 ],
        store: {},
        filter: 'function',
      });
      
      done();
    });
  
    // run test function on client
    clientTest(feathersClient => {
      feathersClient.io.emit('add-publication', {
        serviceName: 'messages', name: 'truthy', params: [1, 2]
      });
    });
  });
  
  it('removes non-existent publication', done => {
    // event signals end of processing
    feathersClient.io.on('_testing', data => {
  
      assert.deepEqual(data, {
        source: 'removePublication',
        serviceName: 'messages',
        keys: [],
      });
      
      done();
    });
    
    // run test function on client
    clientTest(feathersClient => {
      feathersClient.io.emit('remove-publication', { serviceName: 'messages' });
    });
  });
  
  it('removes publication', done => {
    // event signals end of processing
    feathersClient.io.on('_testing', data => {
      if (data.source === 'addPublication') {
        // remove publication
        clientTest(feathersClient => {
          feathersClient.io.emit('remove-publication', { serviceName: 'messages' });
        });
      } else {
        assert.deepEqual(data, {
          source: 'removePublication',
          serviceName: 'messages',
          keys: [],
        });
  
        done();
      }
    });

    // add publication
    clientTest(feathersClient => {
      feathersClient.io.emit('add-publication', {
        serviceName: 'messages', name: 'truthy', params: [1, 2]
      });
    });
  });
});

// Helpers

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
