'use strict';
/* global vl */

describe('Service: Spec', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  beforeEach(module('vleApp', function ($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  // instantiate service
  var Spec;
  beforeEach(inject(function (_Spec_) {
    Spec = _Spec_;
  }));

  it('should be defined', function () {
    expect(Spec).toBeDefined();
  });

  it('functions should be defined', function () {
    expect(Spec.resetSpec).toBeDefined();
    expect(Spec.parseShorthand).toBeDefined();
  });

  describe('_removeEmptyFieldDefs', function () {
    describe('empty spec', function () {
      it('should be cleaned', function () {
        var spec = vl.schema.instantiate();
        Spec._removeEmptyFieldDefs(spec);
        expect(vl.keys(spec.enc).length).toBe(0);
      });
    });
  });

  describe('updateSpec', function () {
    //TODO write tests
  });

  describe('resetSpec', function () {
    //TODO write tests
  });
});
