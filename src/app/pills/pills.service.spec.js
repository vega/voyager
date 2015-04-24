'use strict';

describe('Service: Pills', function () {

  // load the service's module
  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl);
  }));

  // instantiate service
  var Pills;
  beforeEach(inject(function (_Pills_) {
    Pills = _Pills_;
  }));

  it('should do something', function () {
    expect(Pills).toBeTruthy();
  });

});