
const { query } = require('../src/common-publications');
const assert = require('chai').assert;

describe('common-publications', () => {
  describe('query', () => {
    it('simple match, 1 prop', () => {
      const filter = query({ dept: 'a' });
      
      assert.isTrue(filter({ dept: 'a' }));
      assert.isFalse(filter({ dept: 'b' }));
    });
  
    it('simple match, 2 props', () => {
      const filter = query({ dept: 'acct' });
    
      assert.isTrue(filter({ name: 'john', dept: 'acct' }));
      assert.isFalse(filter({ name: 'nick', dept: 'xacct' }));
    });
  });
});