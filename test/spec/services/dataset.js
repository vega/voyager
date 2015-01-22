'use strict';

describe('Service: Dataset', function () {
  // load the service's module
  beforeEach(module('vleApp'));

  beforeEach(module('vleApp', function ($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  beforeEach(module('vleApp', function ($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  // instantiate service
  var dataset;
  beforeEach(inject(function (_Dataset_) {
    dataset = _Dataset_;
  }));

  it('datasets should be there', function () {
    expect(dataset.datasets).toBeDefined();
    expect(dataset.datasets.length).toBe(9);
  });
});
