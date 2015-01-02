'use strict';

angular.module('vleApp')
  .controller('ConfigCtrl', function ($scope, Config, Encoding) {
    $scope.config = Config.config;
    $scope.schema = Config.schema;

    $scope.Config = Config;

    $scope.$watch(
      function(){ return Config.config },
      function(newConfig) {
        $scope.config = newConfig;
      }
    );

    $scope.schema = null;
    Encoding.getEncodingSchema().then(function(schema) {
      $scope.schema = schema.properties.cfg;
    });
  });
