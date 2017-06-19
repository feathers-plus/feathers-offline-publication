
const io = require('socket.io-client');
const feathers = require('feathers-client');
const debug = require('debug')('pub-test-client');

const publicationClient = require('../../src/client');

let feathersClient;

module.exports = {
  clientConfigure,
  clientTest
};

function clientConfigure () {
  debug('clientConfigure start');

  const ioOptions = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
  };

  feathersClient = feathers()
    .configure(feathers.socketio(io('http://localhost:3030', ioOptions)))
    .configure(feathers.hooks());

  debug('clientConfigure end');
  return feathersClient;
}

function clientTest (test) {
  debug('clientTest start');

  const x = test(feathersClient, publicationClient);

  debug('clientTest end', typeof x);
  return x;
}
