
import { stripSlashes } from 'feathers-commons/lib/utils';
import makeDebug from 'debug';

const debug = makeDebug('pub-client');

export function addPublication(app, serviceName, publication) {
  debug('addPublication', serviceName);
  const socket = app.io || app.primus;
  const { module, name, params, ifServer = true } = publication;
  
  if (!serviceName || typeof serviceName !== 'string') {
    throw new Error(`No service name provided. (offline-publication)`);
  }
  
  if(!app.service(serviceName)) {
    throw new Error(`No service found for path ${serviceName}. (offline-publication)`);
  }
  
  if (typeof module !== 'object' || module === null) {
    throw new Error(`No publication module provided for ${this.serviceName}. (offline-publication)`);
  }
  
  if (!name || typeof name !== 'string') {
    throw new Error(`No publication name provided for ${this.serviceName}. (offline-publication)`);
  }
  
  if (typeof module[name] !== 'function') {
    throw new Error(`Publication ${name} is not a function. (offline-publication)`);
  }
  
  if (typeof ifServer !== 'boolean') {
    throw new Error('ifServer must be a boolean. (offline-publication)');
  }
  
  const filter = module[name](...(Array.isArray(params) ? params : [params]));
  
  if (socket && publication && ifServer) {
    const data = Object.assign({}, publication, { serviceName: stripSlashes(serviceName) });
    delete data.module;
    delete data.ifServer;
  
    debug('emit add-publication', data);
    socket.emit('add-publication', data);
  }
  
  return filter;
}

export function removePublication(app, serviceName) {
  debug('remove Publication', serviceName);
  const socket = app.io || app.primus;
  
  if (socket) {
    const data = { serviceName: stripSlashes(serviceName) };
  
    debug('emit remove-publication', data);
    socket.emit('remove-publication', data);
  }
}
