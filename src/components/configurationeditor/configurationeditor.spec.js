'use strict';

describe('Directive: configurationEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    var mock = {};
    $provide.value('Config', mock);
  }));

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();

    element = angular.element('<configuration-editor></configuration-editor>');
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('should insert form', function() {
    expect(element.find('form').length).toBe(1);
  });

  it('should attach config to scope', function () {
    var isolateScope = element.isolateScope();
    expect(isolateScope.Config).toBeDefined();
  });
});
