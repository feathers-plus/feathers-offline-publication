
const assert = require('chai').assert;
const feathers = require('feathers');
const memory = require('feathers-memory');
const hooks = require('feathers-hooks');
const socketio = require('feathers-socketio');

const { clientConfigure, clientTest } = require('./helpers/client');

function services1 () {
  const app = this;
  app.configure(messages)
}

function messages () {
  const app = this;
  app.use('/messages', memory({}));
}

describe('check test scaffolding', () => {
  let app;
  let server;
  let connection;
  let echo;
  
  beforeEach(done => {
    connection = 0;
    echo = 0;
    
    app = feathers()
      .configure(hooks())
      .configure(socketio())
      .configure(services1);
    
    server = app.listen(3030);
    
    server.on('listening', () => done());
  });
  
  afterEach(() => {
    server.close();
  });
  
  it('works', done => {
    app.io.on('connection', socket => {
      connection += 1;
      
      socket.on('echo', data => {
        echo =+ 1;
        
        assert.equal(connection, 1);
        assert.equal(echo, 1);
        assert.equal(data, 'echo echo');
        assert.equal(socket.feathers.provider, 'socketio');
        
        done();
      });
  
      clientTest(feathersClient => {
        feathersClient.io.emit('echo', 'echo echo');
      });
    });
  
    clientConfigure();
  });
  
  it('works again', done => {
    app.io.on('connection', socket => {
      connection += 1;
      
      socket.on('echo', data => {
        echo =+ 1;
  
        assert.equal(connection, 1);
        assert.equal(echo, 1);
        assert.equal(data, 'echo echo');
        assert.equal(socket.feathers.provider, 'socketio');
  
        done();
      });
      
      clientTest(feathersClient => {
        feathersClient.io.emit('echo', 'echo echo');
      });
    });
    
    clientConfigure();
  });
});

// Helpers

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
