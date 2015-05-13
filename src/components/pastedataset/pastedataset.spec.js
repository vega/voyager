'use strict';

describe('Directive: pasteDataset', function () {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<paste-dataset></paste-dataset>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the pasteDataset directive');
  }));
});