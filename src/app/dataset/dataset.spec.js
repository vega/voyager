'use strict';

describe('Service: Dataset', function() {
  // load the service's module
  beforeEach(module('vegalite-ui'));

  beforeEach(module('vegalite-ui', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  // instantiate service
  var dataset;
  beforeEach(inject(function(_Dataset_) {
    dataset = _Dataset_;
  }));

  it('datasets should be there', function() {
    expect(dataset.datasets).toBeDefined();
    expect(dataset.datasets.length).toBe(13);
  });
});
