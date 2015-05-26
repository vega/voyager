'use strict';

/* global vl:true */

describe('Directive: functionSelect', function() {

  // load the directive's module
  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl);
  }));

  var element, scope, $compile;

  beforeEach(inject(function($rootScope, _$compile_) {
    scope = $rootScope.$new();
    scope.schema = {
      properties: {
        aggregate: {
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
      y: { aggregate: 'count', name:'*'},
      color: { type: 'T', name: 'c'},
      update: function() {}
    };
    scope.enc = {
      x: { type: 'Q', name: 'x'},
      y: { aggregate: 'count', name:'*'},
      color: { type: 'T', name: 'c'},
    };
    scope.encType = 'x';
    scope.encType2 = 'y';
    scope.encType3 = 'color';

    $compile = _$compile_;
  }));

  it('should have correct number of radio', function() {
    element = angular.element('<function-select field="enc[encType]" enc-type="encType" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('input').length).to.eql(4);
  });

  it('should have correct number of radio', function() {
    element = angular.element('<function-select  field="enc[encType3]" enc-type="encType3" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('input').length).to.eql(3);
  });

  it('should not show other options for count field', function() {
    element = angular.element('<function-select  field="enc[encType2]" enc-type="encType2" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    scope.pills.y = { aggregate:'count', name: '*'};
    scope.$digest();
    expect(element.find('input').length).to.eql(1);
  });

});
