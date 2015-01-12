'use strict';

describe('Directive: vlSpecEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    var mock = {
      vlSpec: {},
      shorthand: 'point.'
    };
    $provide.value('Vegalite', mock);
    $provide.value('VegaliteSpec', {
      parseShorthand: function(){}
    });
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should show source code', inject(function ($compile) {
    element = angular.element('<vl-spec-editor></vl-spec-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find(".vlspec").val()).toBe("{}");
    expect(element.find(".shorthand").val()).toBe("point.");
  }));
});
