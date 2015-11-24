'use strict';
/* global vl */
/* jshint expr:true */

describe('Service: Spec', function() {

  // load the service's module
  beforeEach(module('polestar'));

  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
    $provide.constant('dl', dl); // dl is loaded by karma
  }));

  // instantiate service
  var Spec;
  beforeEach(inject(function(_Spec_) {
    Spec = _Spec_;
  }));

  it('should be defined', function() {
    expect(Spec).to.be.defined;
  });

  it('functions should be defined', function() {
    expect(Spec.reset).to.be.defined;
    expect(Spec.parseShorthand).to.be.defined;
  });

  describe('_removeEmptyFieldDefs', function() {
    describe('empty spec', function() {
      it('should be cleaned', function() {
        var spec = vl.schema.instantiate();
        Spec._removeEmptyFieldDefs(spec);
        expect(dl.keys(spec.encoding).length).to.eql(3);  // color, size, shape
      });
    });
  });

  describe('updateSpec', function() {
    //TODO write tests
  });

  describe('resetSpec', function() {
    //TODO write tests
  });
});
