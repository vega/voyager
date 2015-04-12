'use strict';

describe('Directive: shelves', function() {

  // load the directive's module
  beforeEach(module('polestar'));

  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  var element,
    scope,
    deferred;

  beforeEach(module('polestar', function($provide) {
    // add Directive suffix to mock directives
    $provide.value('fieldDefEditorDirective', {});
    $provide.value('functionSelectDirective', {});
    $provide.factory('VegaliteSpecSchema', function($q) {
      return {
        getSchema: function() {
          deferred = $q.defer();
          return deferred.promise;
        }
      };
    });
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    element = angular.element('<shelves></shelves>');
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('should insert mark select', function() {
    expect(element.find('.markselect').length).toBe(1);
  });

  it('should attach Spec and schema to scope', function() {
    var isolateScope = element.isolateScope();
    expect(isolateScope.Spec).toBeDefined();
    expect(isolateScope.schema).toBeDefined();
  });
});
