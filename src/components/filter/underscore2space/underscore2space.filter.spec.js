'use strict';

describe('Filter: underscore2space', function () {

  // load the filter's module
  beforeEach(module('polestar'));

  // initialize a new instance of the filter before each test
  var underscore2space;
  beforeEach(inject(function ($filter) {
    underscore2space = $filter('underscore2space');
  }));

  it('should return the input with _ replaced', function () {
    var text = 'foo_bar__baz';
    expect(underscore2space(text)).toBe('foo bar baz');
  });

});