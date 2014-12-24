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

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.datasets.length).toBe(10);
  });
});
