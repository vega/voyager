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
            quantitative: ['a', 'b'],
            undefined: []
          }
        },
        timeUnit: {
          supportedEnums: {
            temporal: ['f1','f2']
          }
        },
        bin: {
          supportedTypes: {
            quantitative: true
          }
        }
      }
    };
    scope.pills = {
      x: { type: 'quantitative', field: 'x'},
      y: { aggregate: 'count', field:'*'},
      color: { type: 'temporal', field: 'c'},
      update: function() {}
    };
    scope.encoding = {
      x: { type: 'quantitative', field: 'x'},
      y: { aggregate: 'count', field:'*'},
      color: { type: 'temporal', field: 'c'},
    };
    scope.channel = 'x';
    scope.channel2 = 'y';
    scope.channel3 = 'color';

    $compile = _$compile_;
  }));

  it('should have correct number of radio', function() {
    element = angular.element('<function-select field-def="encoding[channel]" channel="channel" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('input').length).to.eql(4);
  });

  it('should have correct number of radio', function() {
    element = angular.element('<function-select  field-def="encoding[channel3]" channel="channel3" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('input').length).to.eql(3);
  });

  it('should not show other options for count field', function() {
    element = angular.element('<function-select  field-def="encoding[channel2]" channel="channel2" pills="pills" schema="schema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    scope.pills.y = { aggregate:'count', field: '*'};
    scope.$digest();
    expect(element.find('input').length).to.eql(1);
  });

});
