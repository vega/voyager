'use strict';

describe('Controller: SchemaCtrl', function () {

  // load the controller's module
  beforeEach(module('vleApp'));

  var SchemaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SchemaCtrl = $controller('SchemaCtrl', {
      $scope: scope
    });
  }));

  it('initial schema should be empty', function () {
    expect(scope.schema.length).toBe(0);
  });
});
