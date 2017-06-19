
const sift = require('sift');

module.exports = {
  query (query) {
    const sifter = sift(query);

    return (data, connection, hook) => sifter(data);
  }
};
