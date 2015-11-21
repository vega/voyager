'use strict';

describe('Directive: functionList', function() {

  // load the directive's module
  beforeEach(module('voyager'));

  var scope, $compile;

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;

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
      y: null,
      color: { type: 'temporal', field: 'c'},
      update: function() {}
    };
    scope.channel = 'x';
    scope.channel2 = 'y';
    scope.channel3 = 'color';
  }));

  it('should have correct number of radio', function() {
    // FIXME
  });

});
