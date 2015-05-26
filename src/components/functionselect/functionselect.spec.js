'use strict';

describe('Directive: functionSelect', function() {

  // load the directive's module
  beforeEach(module('voyager'));

  var element, scope, $compile;

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;

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
      y: null,
      color: { type: 'T', name: 'c'},
      update: function() {}
    };
    scope.encType = 'x';
    scope.encType2 = 'y';
    scope.encType3 = 'color';
  }));

  it('should have correct number of radio', function() {
    // FIXME
  });

});
