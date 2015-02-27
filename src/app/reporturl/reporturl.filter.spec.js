'use strict';

describe('Filter: reportUrl', function () {

  // load the filter's module
  beforeEach(module('vleApp'));

  // initialize a new instance of the filter before each test
  var reportUrl;

  beforeEach(module('vleApp', function($provide) {
    $provide.constant('consts', {report: 'voyager'});
  }));

  beforeEach(inject(function ($filter) {
    reportUrl = $filter('reportUrl');
  }));

  it('should return url for error report', function () {
    expect(reportUrl({})).toBe('https://docs.google.com/forms/d/1T9ZA14F3mmzrHR7JJVUKyPXzrMqF54CjLIOjv2E7ZEM/viewform?');
  });

});