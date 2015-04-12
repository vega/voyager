'use strict';

describe('Filter: encodeURI', function () {

  // load the filter's module
  beforeEach(module('polestar'));

  // initialize a new instance of the filter before each test
  var encodeUri;
  beforeEach(inject(function ($filter) {
    encodeUri = $filter('encodeURI');
  }));
});