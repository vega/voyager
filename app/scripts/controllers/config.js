'use strict';

angular.module('vleApp')
  .controller('ConfigCtrl', function ($scope, Config) {
    $scope.config = null;
    $scope.schema = null;
    Config.then(function(service) {
      $scope.schema = service.schema;
      $scope.config = service.cfg;
    });
  });
