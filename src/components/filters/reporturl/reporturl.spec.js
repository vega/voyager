'use strict';

describe('Filter: reportUrl', function () {

  // load the filter's module
  beforeEach(module('polestar'));

  // initialize a new instance of the filter before each test
  var reportUrl;

  beforeEach(module('polestar', function($provide) {
    $provide.constant('consts', {report: 'voyager'});
  }));

  beforeEach(inject(function ($filter) {
    reportUrl = $filter('reportUrl');
  }));

  it('should return url for error report', function () {
    expect(reportUrl({})).toBe('https://docs.google.com/forms/d/1xKs-qGaLZEUfbTmhdmSoS13OKOEpuu_NNWE5TAAml_Y/viewform?');
  });

});