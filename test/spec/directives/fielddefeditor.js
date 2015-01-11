'use strict';

describe('Directive: fieldDefEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    $provide.value('Dataset', {});
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.encType = 'foobar';
    scope.fieldDef = {};
    scope.schema = {};
  }));

  it('should show title', inject(function ($compile) {
    element = angular.element('<field-def-editor enc-type="encType" field-def="fieldDef" schema="schema"></field-def-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('h4').text()).toBe('foobar');
  }));
});
