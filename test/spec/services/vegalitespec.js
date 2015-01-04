'use strict';

describe('Service: VegaliteSpec', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var spec;
  beforeEach(inject(function (_VegaliteSpec_) {
    spec = _VegaliteSpec_;
  }));

  it('should be defined', function () {
    expect(spec).toBeDefined();
  });

  it('functions should be defined', function () {
    expect(spec.resetSpec).toBeDefined();
    expect(spec.parseShorthand).toBeDefined();
  });

});
