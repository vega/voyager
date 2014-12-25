'use strict';

describe('Service: configService', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var config;
  beforeEach(inject(function (_configService_) {
    config = _configService_;
  }));

  it('should do something', function () {
    expect(!!config).toBe(true);
  });

});
