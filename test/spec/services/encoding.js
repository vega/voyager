'use strict';

describe('Service: Encoding', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var Encoding;
  beforeEach(inject(function (_Encoding_) {
    Encoding = _Encoding_;
  }));

  it('should do something', function () {
    expect(Encoding).toBeDefined();
  });

});
