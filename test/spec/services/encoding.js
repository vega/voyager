'use strict';

describe('Service: Encoding', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var encoding;
  beforeEach(inject(function (_Encoding_) {
    encoding = _Encoding_;
  }));

  it('should do something', function () {
    expect(encoding).toBeDefined();
  });

  it('functions should be defined', function () {
    expect(encoding.getEncoding).toBeDefined();
    expect(encoding.getEncodingSchema).toBeDefined();
  });

});
