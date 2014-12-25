'use strict';

describe('Service: schemaService', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var schema;
  beforeEach(inject(function (_schemaService_) {
    schema = _schemaService_;
  }));

  it('should do something', function () {
    expect(!!schema).toBe(true);
  });

});
