'use strict';

describe('Controller: EncodingCtrl', function () {

  // load the controller's module
  beforeEach(module('vleApp'));

  var EncodingCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EncodingCtrl = $controller('EncodingCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.marks).toBeDefined();
  });
});
