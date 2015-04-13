'use strict';

describe('Directive: encodingVariations', function () {

  // load the directive's module
  beforeEach(module('voyager'));

  var element,
    scope;


  beforeEach(module('voyager', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<encoding-variations></encoding-variations>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the encodingVariations directive');
  }));
});