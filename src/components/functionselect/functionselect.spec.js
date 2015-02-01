'use strict';

describe('Directive: functionSelect', function() {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
    scope.schema = {
      properties: {
        aggr: {
          supportedEnums: {
            Q: ['a', 'b']
          }
        },
        fn: {
          enum: ['f1','f2']
        },
        bin: {
          supportedTypes: {
            Q: true
          }
        }
      }
    };
    scope.pills = {
      x: { type: 'Q', name: 'x'},
      update: function() {}
    };
    scope.encType = 'x';
  }));

  it('should have correct number of radio', inject(function($compile) {
    element = angular.element('<function-select enc-type="encType" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    console.log('element', element);
    console.log('scope.func', scope.func);
    expect(element.find('input').length).toBe(6);
  }));
});
