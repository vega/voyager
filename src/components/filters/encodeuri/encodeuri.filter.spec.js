'use strict';

describe('Filter: encodeURI', function () {

  // load the filter's module
  beforeEach(module('vleApp'));

  // initialize a new instance of the filter before each test
  var encodeUri;
  beforeEach(inject(function ($filter) {
    encodeUri = $filter('encodeURI');
  }));

  it('should return the input prefixed with "encodeURI filter:"', function () {
    var text = 'angularjs';
    expect(encodeUri(text)).toBe(window.encodingUri(text));
  });

});