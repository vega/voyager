'use strict';

describe('Directive: fieldInfo', function () {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(module('vleApp', function($provide) {
    $provide.value('Dataset', {
      typeNames: {
        O: 'ordinal'
      }
    });
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.field = {
      name: 'foo',
      type: 'O',
      bin: true,
    };
    scope.showType = true;
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<field-info field="field" showType="showType"></field-info>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.type').length).toBe(1);
    expect(element.find('.field-func').length).toBe(1);
  }));
});