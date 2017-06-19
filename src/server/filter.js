
import makeDebug from 'debug';

const debug = makeDebug('pub-filter');

export default function filter (serviceName) {
  return (data, connection, hook) => {
    debug(`Service filter for ${serviceName} start`);
    const _publications_ = connection._publications_;
    const _before = hook.params._before;

    debug('--- filter', hook.method);
    debug('from', _before || '');
    debug('to  ', data);

    // Leave if no publication exists or if the publication is not to run on the server
    if (!_publications_ || !_publications_[serviceName] || !_publications_[serviceName].ifServer) {
      debug('NEED, as no filter');
      return data;
    }

    const ifBeforeNeeded = _before ? _publications_[serviceName].filter(_before) : false;
    const ifAfterNeeded = _publications_[serviceName].filter(data);

    debug(`Service filter end. before ${ifBeforeNeeded}. after ${ifAfterNeeded}`);
    debug('return', ifBeforeNeeded || ifAfterNeeded ? data : false);
    return ifBeforeNeeded || ifAfterNeeded ? data : false;
  };
}
