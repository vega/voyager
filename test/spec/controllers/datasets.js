'use strict';

describe('Controller: DatasetsCtrl', function () {

  // load the controller's module
  beforeEach(module('vleApp'));

  var DatasetsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DatasetsCtrl = $controller('DatasetsCtrl', {
      $scope: scope
    });
  }));

  it('should attach dataset', function () {
    expect(scope.dataset).toBeDefined();
  });

  it('should attach datasets', function () {
    expect(scope.datasets.length).toBe(9);
  });

  it('should attach dataset service', function () {
    expect(scope.Dataset).toBeDefined();
  });
});
