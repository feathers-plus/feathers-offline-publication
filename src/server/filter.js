
import makeDebug from 'debug';

const debug = makeDebug('pub-filter');

export default function filter (serviceName) {
  return (data, connection, hook) => {
    debug(`Service filter for ${serviceName} start`);
    const _publications_ = connection._publications_;
    const before = hook.params.before;

    debug('.filter', hook.method);
    debug('from', before);
    debug('to  ', data);

    // Leave if previous filter rejected the event
    if (typeof data !== 'object' || data === null) { return data; }

    // Leave if no publication exists
    if (!_publications_ || !_publications_[serviceName]) {
      debug('NEED, as no filter');
      return data;
    }

    // Check pre-mutated record if it is stashed in hook.params.before
    const ifBeforeNeeded = before ? _publications_[serviceName].filter(before) : false;
    const ifAfterNeeded = _publications_[serviceName].filter(data);

    debug(`Service filter end. before ${ifBeforeNeeded}. after ${ifAfterNeeded}`);
    debug('return', ifBeforeNeeded || ifAfterNeeded ? data : false);
    return ifBeforeNeeded || ifAfterNeeded ? data : false;
  };
}
