'use strict';

describe('Directive: fieldDefEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.encType = 'foobar';
    scope.fieldDef = {};
    scope.schema = {};
  }));

  it('should show title', inject(function ($compile) {
    element = angular.element('<field-def-editor></field-def-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect($(element).find('h4').text()).toBe('foobar');
  }));
});
