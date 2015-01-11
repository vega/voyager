'use strict';

describe('Directive: vgSpecEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = {
      vgSpec: "{}"
    };
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<vg-spec-editor></vg-spec-editor>');
    element = $compile(element)(scope);
    expect(scope.vgSpec).toBe("{}");
  }));
});
