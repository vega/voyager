'use strict';

describe('Service: Vegalite', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var Vegalite;
  beforeEach(inject(function (_Vegalite_) {
    Vegalite = _Vegalite_;
  }));

  it('should do something', function () {
    expect(!!Vegalite).toBe(true);
  });

});
