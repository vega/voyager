'use strict';

describe('Service: Visrec', function () {

  // load the service's module
  beforeEach(module('facetedviz'));

  beforeEach(module('facetedviz', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  // instantiate service
  var Visrec;
  beforeEach(inject(function (_Visrec_) {
    Visrec = _Visrec_;
  }));

  it('should do something', function () {
    expect(Visrec).toBeTruthy();
  });

});