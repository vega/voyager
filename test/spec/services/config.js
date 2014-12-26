'use strict';

describe('Service: Config', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var config;
  beforeEach(inject(function (_Config_) {
    config = _Config_;
  }));

  it('should do something', function () {
    expect(!!config).toBe(true);
  });

  it('should have useServer property', function () {
    expect(!!config.useServer).toBe(true);
  });

});
