'use strict';

angular.module('vleApp')
  .controller('ConfigCtrl', function ($scope, Config) {
    $scope.Config = Config;
  });
