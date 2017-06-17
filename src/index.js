// import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('feathers-offline-publication');

export default function init () {
  debug('Initializing feathers-offline-publication plugin');
  return 'feathers-offline-publication';
}
