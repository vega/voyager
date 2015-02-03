'use strict';

angular.module('vleApp')
  .controller('MainCtrl', function($scope, Spec, consts) {
    $scope.Spec = Spec;
    $scope.consts = consts;
    $scope.showDevPanel = consts.debug;
  });
