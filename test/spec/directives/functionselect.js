'use strict';

describe('Directive: functionSelect', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.fieldDefSchema = {
      properties: {
        aggr: {
          supportedEnums: {
            Q: ['a', 'b']
          }
        }
      }
    };
    scope.fieldDef = {
      type: 'Q',
      name: 'x'
    };
  }));

  it('should have correct number of options', inject(function ($compile) {
    element = angular.element('<function-select field-def="fieldDef", field-def-schema="fieldDefSchema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('option').length).toBe(3);
  }));
});
