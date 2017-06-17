# feathers-offline-publication

[![Build Status](https://travis-ci.org/feathersjs/feathers-offline-publication.png?branch=master)](https://travis-ci.org/feathersjs/feathers-offline-publication)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-offline-publication/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-offline-publication)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-offline-publication/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-offline-publication/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-offline-publication.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-offline-publication)
[![Download Status](https://img.shields.io/npm/dm/feathers-offline-publication.svg?style=flat-square)](https://www.npmjs.com/package/feathers-offline-publication)

> todo

**Work in progress. Do not use.**

## Installation

```
npm install feathers-offline-publication --save
```

## Documentation

Please refer to the [feathers-offline-publication documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-offline-publication`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('feathers-offline-publication');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin', plugin())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
