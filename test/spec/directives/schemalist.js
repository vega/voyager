'use strict';

describe('Directive: schemaList', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<schema-list></schema-list>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the schemaList directive');
  }));
});
