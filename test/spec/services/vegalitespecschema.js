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
    expect(Schema.getSchema).toBeDefined();
    expect(Schema.instanceFromSchema).toBeDefined();
  });

  it('correct instance from schema', function () {
    var schema = {
      type: 'object', required: ['fooBaz'],
      properties: {
        fooBar: {type: 'string', default: 'baz'},
        fooBaz: {type: 'string', enum: ['a', 'b']}}};
    expect(Schema.instanceFromSchema(schema)).toEqual({fooBar: 'baz', fooBaz: 'a'});
  });

});
