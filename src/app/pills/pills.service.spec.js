'use strict';

describe('Service: Pills', function () {

  // load the service's module
  beforeEach(module('polestar'));

  // instantiate service
  var Pills;
  beforeEach(inject(function (_Pills_) {
    Pills = _Pills_;
  }));

  it('should do something', function () {
    expect(Pills).toBe(true);
  });

});