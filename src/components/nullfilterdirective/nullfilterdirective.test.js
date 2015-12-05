'use strict';

describe('Directive: nullFilterDirective', function () {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;

  beforeEach(module('polestar', function($provide) {
    $provide.value('Dataset', {});
    $provide.value('Spec', {});
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<null-filter-directive></null-filter-directive>');
    element = $compile(element)(scope);
    expect(element.length).to.eql(1);
  }));
});