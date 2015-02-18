'use strict';

describe('Directive: fieldInfo', function () {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;


  beforeEach(module('vleApp', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();

  }));

  it('should appear', inject(function ($compile) {
    element = angular.element('<field-info></field-info>');
    element = $compile(element)(scope);
    expect(element.find('.hflex')).toBeTruthy();
  }));
});