
import makeDebug from 'debug';

const debug = makeDebug('pub-server');

export default function publication (app, publications, extraEvents = {}) {
  debug('Configure publications start.');

  const events = Object.assign({}, {
    'add-publication': addPublication, 'remove-publication': removePublication
  }, extraEvents);
  let socketHandler, getFeathersStore, setFeathersStore;

  if (app.io) {
    debug('socket.io');
    socketHandler = 'io';
    getFeathersStore = socket => socket.feathers;
    setFeathersStore = (socket, data) => { socket.feathers = data; };
  } else {
    debug('primus');
    socketHandler = 'primus';
    getFeathersStore = socket => socket.request.feathers;
    setFeathersStore = (socket, data) => { socket.request.feathers = data; };
  }

  app[socketHandler].on('connection', socket => {
    Object.keys(events).forEach(name => {
      debug(`Register listener for ${name} event`);

      socket.on(name, events[name]({
        socket,
        namespace: '_publications_',
        publications,
        getFeathersStore,
        setFeathersStore
      }));
    });
  });

  debug('Configure publications end');
}

function addPublication ({ socket, namespace, publications, getFeathersStore, setFeathersStore }) {
  debug('addPublication construct');

  return ({ serviceName, name, params }) => {
    debug('addPublication start', serviceName, name, params);
    const feathersStore = getFeathersStore(socket);
    params = Array.isArray(params) ? params : [params];

    if (!feathersStore[namespace]) {
      feathersStore[namespace] = {};
    }

    const store = feathersStore[namespace][serviceName] =
      Object.assign({}, { filter: publications[name](...(params || [])) });

    setFeathersStore(socket, feathersStore);

    socket.emit('_testing', { // needed for test
      source: 'addPublication', serviceName, name, params, store, filter: typeof store.filter
    });

    debug('addPublication end', store);
  };
}

function removePublication ({ socket, namespace, getFeathersStore, setFeathersStore }) {
  debug('removePublication constructor');

  return ({ serviceName }) => {
    debug('removePublication start', serviceName);
    const feathersStore = getFeathersStore(socket);

    if (feathersStore[namespace]) {
      delete feathersStore[namespace][serviceName];
      setFeathersStore(socket, feathersStore);
    }

    socket.emit('_testing', { // needed for test
      source: 'removePublication', serviceName, keys: Object.keys(feathersStore[namespace] || {})
    });

    debug('removePublication end', feathersStore);
  };
}
