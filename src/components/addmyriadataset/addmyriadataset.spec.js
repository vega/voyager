'use strict';

describe('Directive: addMyriaDataset', function () {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should show correct form', inject(function ($compile) {
    element = angular.element('<add-myria-dataset></add-myria-dataset>');
    element = $compile(element)(scope);

    scope.$digest();
    expect(element.find('button').length).to.eql(1);
  }));
});