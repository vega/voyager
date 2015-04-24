'use strict';

describe('Directive: addDataset', function () {

  // load the directive's module
  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl);
  }));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<add-dataset></add-dataset>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('div').length).toBe(1);
  }));
});