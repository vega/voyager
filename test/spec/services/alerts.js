'use strict';

describe('Service: Alerts', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var alerts;
  beforeEach(inject(function (_Alerts_) {
    alerts = _Alerts_;
  }));

  it('should add alerts', function () {
    expect(alerts.alerts).toEqual([]);
    alerts.add('foo');
    expect(alerts.alerts).toEqual([{msg: 'foo'}]);
    alerts.add('bar');
    expect(alerts.alerts).toEqual([{msg: 'foo'}, {msg: 'bar'}]);
    alerts.closeAlert(0);
    expect(alerts.alerts).toEqual([{msg: 'bar'}]);
  });

});
