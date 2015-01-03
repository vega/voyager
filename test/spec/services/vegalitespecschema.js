'use strict';

describe('Service: VegaliteSpecSchema', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var Schema;
  beforeEach(inject(function (_VegaliteSpecSchema_) {
    Schema = _VegaliteSpecSchema_;
  }));

  it('should be defined', function () {
    expect(Schema).toBeDefined;
  });

  it('functions should be defined', function () {
    expect(Spec.getSchema).toBeDefined();
    expect(Spec.instanceFromSchema).toBeDefined();
  });

});
