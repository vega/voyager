'use strict';

describe('Directive: jsonInput', function () {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<json-input></json-input>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the jsonInput directive');
  }));
});
