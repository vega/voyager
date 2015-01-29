'use strict';

describe('Service: Visrec', function () {

  // load the service's module
  beforeEach(module('facetedviz'));

  // instantiate service
  var Visrec;
  beforeEach(inject(function (_Visrec_) {
    Visrec = _Visrec_;
  }));

  it('should do something', function () {
    expect(Visrec).toBe(true);
  });

});