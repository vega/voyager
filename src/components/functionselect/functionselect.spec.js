'use strict';

describe('Directive: functionSelect', function() {

  // load the directive's module
  beforeEach(module('vegalite-ui'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
    scope.schema = {
      properties: {
        aggr: {
          supportedEnums: {
            Q: ['a', 'b'],
            undefined: []
          }
        },
        fn: {
          supportedEnums: {
            T: ['f1','f2']
          }
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
      y: null,
      color: { type: 'T', name: 'c'},
      update: function() {}
    };
    scope.encType = 'x';
    scope.encType2 = 'y';
    scope.encType3 = 'color';
  }));

  it('should have correct number of radio', inject(function($compile) {
    element = angular.element('<function-select enc-type="encType" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('input').length).toBe(4);
  }));

  it('should have correct number of radio', inject(function($compile) {
    element = angular.element('<function-select enc-type="encType3" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('input').length).toBe(3);
  }));

  it('should not show other options for count field', inject(function($compile) {
    element = angular.element('<function-select enc-type="encType2" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    scope.pills.y = { aggr:'count', name: '*'};
    scope.$digest();
    expect(element.find('input').length).toBe(1);
  }));

});
