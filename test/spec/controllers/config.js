'use strict';

describe('Controller: ConfigCtrl', function () {

  // load the controller's module
  beforeEach(module('vleApp'));

  var ConfigCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ConfigCtrl = $controller('ConfigCtrl', {
      $scope: scope
    });
  }));

  it('should attach config', function () {
    expect(!!scope.Config).toBe(true);
  });
});
