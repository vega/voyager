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

  it('should attach my dataset', function () {
    expect(!!scope.myDataset).toBe(true);
  });

  it('should attach datasets', function () {
    expect(scope.datasets.length).toBe(10);
  });

  it('should attach schema', function () {
    expect(!!scope.schma).toBe(true);
  });
});
