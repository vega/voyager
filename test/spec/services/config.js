'use strict';

describe('Service: Config', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var config;
  beforeEach(inject(function (_Config_) {
    config = _configService_;
  }));

  it('should do something', function () {
    expect(!!config).toBe(true);
  });

});
