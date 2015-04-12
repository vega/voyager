'use strict';

describe('Directive: schemaListItem', function () {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<schema-list-item></schema-list-item>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the schemaListItem directive');
  }));
});