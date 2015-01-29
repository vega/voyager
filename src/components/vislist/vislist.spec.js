'use strict';

describe('Directive: visList', function () {

  // load the directive's module
  beforeEach(module('facetedviz'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<visList></visList>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the visList directive');
  }));
});