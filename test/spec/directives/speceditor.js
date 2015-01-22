'use strict';

describe('Directive: specEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  beforeEach(module('vleApp', function ($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  var element,
    scope,
    deferred;

  beforeEach(module('vleApp', function ($provide) {
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

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();

    element = angular.element('<spec-editor></spec-editor>');
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('should insert mark select', function() {
    expect(element.find('.markselect').length).toBe(1);
  });

  it('should attach config to scope', function () {
    var isolateScope = element.isolateScope();
    expect(isolateScope.spec).toBeDefined();
    expect(isolateScope.schema).toBeDefined();
  });
});
