'use strict';

describe('Directive: visList', function () {

  // load the directive's module
  beforeEach(module('facetedviz'));

  beforeEach(module('facetedviz', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<vis-list></vis-list>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element).toBe('');
  }));
});