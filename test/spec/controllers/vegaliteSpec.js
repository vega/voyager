'use strict';

describe('Controller: VegaliteSpecCtrl', function () {

  // load the controller's module
  beforeEach(module('vleApp'));

  var VegaliteSpecCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VegaliteSpecCtrl = $controller('VegaliteSpecCtrl', {
      $scope: scope
    });
  }));

  it('should attach spec to the scope', function () {
    expect(scope.spec).toBeDefined();
  });
});
