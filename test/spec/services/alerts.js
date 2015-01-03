'use strict';

describe('Service: Alerts', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var Alerts;
  beforeEach(inject(function (_Alerts_) {
    Alerts = _Alerts_;
  }));

  it('should do something', function () {
    expect(!!Alerts).toBe(true);
  });

});
