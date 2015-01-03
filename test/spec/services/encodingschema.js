'use strict';

describe('Service: EncodingSchema', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var EncodingSchema;
  beforeEach(inject(function (_EncodingSchema_) {
    EncodingSchema = _EncodingSchema_;
  }));

  it('should do something', function () {
    expect(!!EncodingSchema).toBe(true);
  });

});
