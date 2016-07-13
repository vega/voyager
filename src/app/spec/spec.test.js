'use strict';
/* global vl, vg */
/* jshint expr:true */

describe('Service: Spec', function() {

  // load the service's module
  beforeEach(module('polestar'));

  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
    $provide.constant('vg', vg); // vg is loaded by karma
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
        Spec.reset();
        var spec = Spec.spec;
        Spec._removeEmptyFieldDefs(spec);
        expect(vg.util.keys(spec.encoding).length).to.eql(15);  // color, shape, text
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
