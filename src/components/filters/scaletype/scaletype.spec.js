'use strict';

describe('Filter: scaleType', function () {

  // load the filter's module
  beforeEach(module('vleApp'));

  // initialize a new instance of the filter before each test
  var scaleType;
  beforeEach(inject(function ($filter) {
    scaleType = $filter('scaleType');
  }));

  it('should return correct name"', function () {
    expect(scaleType('Q')).toBe('Quantitative');
    expect(scaleType('O')).toBe('Ordinal');
    expect(scaleType('T')).toBe('Time');
  });

});
