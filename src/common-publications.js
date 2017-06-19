
import sift from 'sift';

export default {
  query (query) {
    const sifter = sift(query);

    return (data, connection, hook) => sifter(data);
  }
};
