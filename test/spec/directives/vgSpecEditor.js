'use strict';

describe('Directive: vgSpecEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    var mock = {
      vgSpec: {}
    };
    $provide.value('Vegalite', mock);
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should show source code', inject(function ($compile) {
    element = angular.element('<vg-spec-editor></vg-spec-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find(".vgspec").val()).toBe("{}");
  }));
});
