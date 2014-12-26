'use strict';

describe('Service: Dataset', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var dataset;
  beforeEach(inject(function (_Dataset_) {
    dataset = _Dataset_;
  }));

  it('should do something', function () {
    expect(!!dataset).toBe(true);
  });

  it('datasets should be there', function () {
    expect(!!dataset.datasets).toBe(true);
    expect(dataset.datasets.length).toBe(10);
  });
});
