'use strict';

describe('Directive: fieldDrop', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should initially have placeholder', inject(function ($compile) {
    element = angular.element('<field-drop></field-drop>');
    element = $compile(element)(scope);
     scope.$digest();

    expect($(element).find('.placeholder').length).toBe(1);
  }));
});
