'use strict';

describe('Directive: encodingVariations', function () {

  // load the directive's module
  beforeEach(module('facetedviz'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<encodingVariations></encodingVariations>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the encodingVariations directive');
  }));
});