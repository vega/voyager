'use strict';

describe('Directive: fieldList', function () {

  // load the directive's module
  beforeEach(module('facetedviz'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fieldList></fieldList>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fieldList directive');
  }));
});