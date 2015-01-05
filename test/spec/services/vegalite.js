'use strict';

describe('Service: Vegalite', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var vl;
  beforeEach(inject(function (_Vegalite_) {
    vl = _Vegalite_;
  }));

  it('should do something', function () {
    expect(vl).toBeDefined();
  });

});
