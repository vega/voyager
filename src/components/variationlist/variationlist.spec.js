'use strict';

describe('Directive: variationList', function () {

  // load the directive's module
  beforeEach(module('facetedviz'));

  var element,
    scope;

  beforeEach(module('facetedviz', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<variation-list></variation-list>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('h3').length).toBe(1);
  }));
});