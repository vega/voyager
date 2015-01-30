'use strict';

describe('Directive: functionSelect', function() {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
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
    scope.pills = {
      x: { type: 'Q', name: 'x'},
      update: function() {}
    };
    scope.encType = 'x';
  }));

  it('should have correct number of options', inject(function($compile) {
    element = angular.element('<function-select enc-type="encType" pills="pills" schema="fieldDefSchema"></function-select>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('option').length).toBe(3);
  }));

  it('should correctly add aggr', function() {
    // TODO(kanitw): write test (I don't write it now because I expect functionselect.js to change from function to radio and the logic will change)
  });

  it('should correctly add fn', function() {
    // TODO(kanitw): write test (I don't write it now because I expect functionselect.js to change from function to radio and the logic will change)
  });

  it('should correctly add bin', function() {
    // TODO(kanitw): write test (I don't write it now because I expect functionselect.js to change from function to radio and the logic will change)
  });
});
