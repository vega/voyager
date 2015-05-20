'use strict';

/* global vl:true */

describe('Service: Fields', function() {
  // load the service's module
  beforeEach(module('voyager'));

  beforeEach(module('voyager', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  // instantiate service
  var Fields;
  beforeEach(inject(function(_Fields_) {
    Fields = _Fields_;
  }));

  it('should test something', function() {
  });
});
