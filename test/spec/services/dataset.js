'use strict';

describe('Service: Dataset', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var dataset;
  beforeEach(inject(function (_Dataset_) {
    dataset = _datasetService_;
  }));

  it('should do something', function () {
    expect(!!dataset).toBe(true);
  });

});
