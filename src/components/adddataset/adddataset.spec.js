'use strict';

describe('Directive: addDataset', function () {

  // load the directive's module
  beforeEach(module('voyager'));

  var element, scope, $compile;

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it('should make hidden element visible', function () {
    element = angular.element('<add-dataset></add-dataset>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.text()).to.eql(' Add dataset');
  });
});