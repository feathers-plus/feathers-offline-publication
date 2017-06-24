# feathers-offline-publication

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-offline-publication.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-offline-publication.png?branch=master)](https://travis-ci.org/feathersjs/feathers-offline-publication)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-offline-publication/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-offline-publication)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-offline-publication/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-offline-publication/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-offline-publication.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-offline-publication)
[![Download Status](https://img.shields.io/npm/dm/feathers-offline-publication.svg?style=flat-square)](https://www.npmjs.com/package/feathers-offline-publication)

> Use dynamic "publications" to minimize the number of service events received by the client.


## Publications

`publications` are objects containing multiple `publication` functions.
These functions determine if a record belongs in the publication or not.
A sample publications is:
```javascript
const publications = {
  username: username => data => data.username === username,
  active: () => data => !data.deleted,
};
```

The publication `publications.username('john')` selects all records whose `username` is `john`;
`publications.active()` selects all logically active records.

The builtin `commonPublications.query({ username: 'john' })` selects records based on the
[query syntax used by MongoDB](https://docs.mongodb.com/manual/reference/operator/query/).


## Minimize service events

Once a client associates a Feathers service with
- a publications object,
- a publication function name, and
- params for that function,

then that client will only be sent service events relevant to that publication.
This may improve performance, especially for mobile devices, as the bandwidth consumed by the client
is reduced.

You can stash the current value of a record inside the hook object, before mutating it, with:
```javascript
module.exports = {
  before: {
    update: stashBefore(),
    patch: stashBefore(),
    remove: stashBefore(),
  },
};
```

The client will receive a service event if either the previous (stashed) value of the record,
or the new value is within the publication.
This double check informs the client of records which previously belonged to the publication,
but no longer do so after the mutation.

## When records remain in the same publication

Its not uncommon, for example, for mobile apps to have unique data per user.
Each service model has a `username` field and, once that field is set on `create`, it never changes.

The client would use a publication such as the `publications.username('john')` from above
to select only the records for its user.

There is no need in this case to check the previous (stashed) value of the record,
and you can eliminate doing so by not running the `stashBefore` hook.
This would also marginally improve performance since `stashBefore` makes a `get` call.


## Example

On server:
```javascript
const serverPublications = require('feathers-publications/lib/server');
const commonPublications = require('feathers-publications/lib/common-publications');
const app = feathers()...

// Configure service event filters for 2 services
serverPublications(app, commonPublications, ['messages', 'channels']);
```

On client:
```javascript
const clientPublications = require('feathers-publications/lib//client');
const commonPublications = require('feathers-publications/lib/common-publications');
const feathersClient = feathers()...

const messages = feathersClient.service('messages');
const username = 'john';

// The only service events to arrive will be those relevant to the publication
messages.on('created', data => ...);
messages.on('updated', data => ...);
messages.on('patched', data => ...);
messages.on('remove', data => ...);

// Configure the publication
const selector = clientPublications.addPublication(feathersClient, 'messages', {
  module: commonPublications,
  name: 'query',
  params: { username },
});

// The publication's filter function is also available on the client
console.log(selector({ username: 'john' })); // true
console.log(selector({ username: 'jack' })); // false
```

Note that the same `publications` object must be provided both on the server and the client.
Also note the client may use the resultant selector function.


## Security

An attacker may modify the `clientPublications.addPublication` call on the client
or issue one of their own.

Feathers supports multiple service events filters for a method,
and a mutation must satisfy them all before being emitted to the client.
You can therefore add filters both before and after the `serverPublications` call
to establish any additional security you need.


## Installation

```
npm install feathers-offline-publication --save
```


## Documentation

### `serverPublications(app, publications, ...serviceNames)`

Configures services on the server which may have publications.
This also configures the service event filters for you.

__Options:__

- `app` (*required*) - The Feathers server app.
- `publications` (*required*, object) - The publications object.
The same object must be used in `clientPublications.addPublication`.
- `serviceNames` (*required*, string or array of strings) -
The service name or names to configure for publications.

### `clientPublications.addPublication(clientApp, serviceName, options)`

Configures a publication on the client for a remote service.

__Options:__

- `clientApp` (*required*) - The Feathers client app.
- `serviceName` (*required*, string) - The service name for which a publication is being configured.
- `options` (*required*, objects) - Contains
    - `module` (*required*, object) - The publications object.
    The same object must be used in `serverPublications`.
    - `name` (*required*, string) - The prop name of the publication in `module`.
    - `params` (*optional*, any or array of any) - The parameters to call `name` with.
    - `ifServer` (*optional*, boolean, default true) - If false,
    no server publication is created, but the selector function is still returned to the client.
    
> **ProTip:** You can find useful publications in
[`feathers-offline-publication/commonPublications`](https://github.com/feathersjs/feathers-offline-publication/blob/master/src/common-publications.js).

> **ProTip:** You can merge the commonPublications with your own ones using
`Object.assign({}, commonPublications, nyCustomPublications)`.


### `clientPublications.removePublication(clientApp, serviceName)`

Removes the publication for a remote service, and stops filtering on the server.

> **ProTip:** The client will receive service events for all mutations.

__Options:__

- `clientApp` (*required*) - The Feathers client app.
- `serviceName` (*required*, string) - The service name whose publication is being removed.

### `commonPublications.query(selection)`

A publication which selects records based on the
[query syntax used by MongoDB](https://docs.mongodb.com/manual/reference/operator/query/).

__Options:__

- `selection` (*required*) - The [query object](https://github.com/crcn/sift.js).
    - Supported operators: $in, $nin, $exists, $gte, $gt, $lte, $lt, $eq, $ne, $mod, $all, $and,
    $or, $nor, $not, $size, $type, $regex, $where, $elemMatch
    - Regexp searches
    - Function filtering
    - sub object searching
    - dot notation searching
    - Custom Expressions
    - filtering of immutable data structures

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
