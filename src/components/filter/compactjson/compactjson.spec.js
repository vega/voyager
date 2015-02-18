'use strict';

describe('Filter: compactJSON', function() {

  // load the filter's module
  beforeEach(module('vegalite-ui'));

  // initialize a new instance of the filter before each test
  var compactJSON;
  beforeEach(inject(function($filter) {
    compactJSON = $filter('compactJSON');
  }));

  it('should return the input prefixed with "compactJSON filter:"', function() {
    var obj = {foo: 'bar'};
    expect(compactJSON(obj)).toBe('{"foo": "bar"}');
  });

});
