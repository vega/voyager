'use strict';

angular.module('vleApp')
  .controller('ConfigCtrl', function ($scope, Config) {
    $scope.useServer = Config.useServer;

    $scope.$watch('useServer', function (newVal, oldVal) {
      Config.useServer = newVal;
    });
  });
