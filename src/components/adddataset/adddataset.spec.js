'use strict';

describe('Directive: addDataset', function () {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<add-dataset></add-dataset>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the addDataset directive');
  }));
});