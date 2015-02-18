'use strict';

describe('Directive: nullFilterDirective', function () {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(module('vleApp', function($provide) {
    $provide.value('Dataset', {});
    $provide.value('Spec', {});
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<null-filter-directive></null-filter-directive>');
    element = $compile(element)(scope);
    expect(element.length).toBe(1);
  }));
});