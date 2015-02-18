'use strict';

describe('Service: Alerts', function() {

  // load the service's module
  beforeEach(module('vegalite-ui'));

  // instantiate service
  var alerts, $timeout;
  beforeEach(inject(function(_Alerts_, _$timeout_) {
    alerts = _Alerts_;
    $timeout = _$timeout_;
  }));

  it('should add alerts', function() {
    expect(alerts.alerts).toEqual([]);
    alerts.add('foo');
    expect(alerts.alerts).toEqual([{msg: 'foo'}]);
    alerts.add('bar');
    expect(alerts.alerts).toEqual([{msg: 'foo'}, {msg: 'bar'}]);
    alerts.closeAlert(0);
    expect(alerts.alerts).toEqual([{msg: 'bar'}]);
  });

  it('alerts should close themselves', function() {
    expect(alerts.alerts).toEqual([]);
    alerts.add('foo', 100);
    expect(alerts.alerts).toEqual([{msg: 'foo'}]);
    $timeout.flush();
    expect(alerts.alerts).toEqual([]);
  });

});
