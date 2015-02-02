'use strict';

angular.module('vleApp')
  .controller('MainCtrl', function($scope, Spec) {
    $scope.Spec = Spec;
    $scope.showDevPanel = true;
  });
