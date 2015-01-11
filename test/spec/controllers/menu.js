'use strict';

describe('Controller: MenuCtrl', function () {

  // load the controller's module
  beforeEach(module('vleApp'));

  var MenuCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = {};
    MenuCtrl = $controller('MenuCtrl', {
      $scope: scope
    });
  }));

  it('should attach showVgSpec()', function () {
    expect(scope.showVgSpec).not.toBe(null);
  });

  it('should attach showVlSpec()', function () {
    expect(scope.showVlSpec).not.toBe(null);
  });
});
