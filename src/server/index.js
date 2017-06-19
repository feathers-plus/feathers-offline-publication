
import { stripSlashes } from 'feathers-commons/lib/utils';
import configure from './configure';
import filter from './filter';
import makeDebug from 'debug';

const debug = makeDebug('pub-filter');

export default function serverPublications (app, publications, ...serviceNames) {
  debug('publicationFilters start');

  serviceNames.forEach(serviceName => {
    debug(`Set filters for ${serviceName}`);
    serviceName = stripSlashes(serviceName);
    const remoteService = app.service(serviceName);

    ['created', 'updated', 'patched', 'removed'].forEach(event => {
      remoteService.filter(event, filter(serviceName));
    });
  });

  // handlers are attached only when connection occurs
  configure(app, publications);

  debug('publicationFilters end');
}
