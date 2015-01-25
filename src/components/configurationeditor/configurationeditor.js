'use strict';

angular.module('vleApp')
  .directive('configurationEditor', function () {
    return {
      templateUrl: 'components/configurationeditor/configurationeditor.html',
      restrict: 'E',
      scope: {},
      controller: function ($scope, Config) {
        $scope.config = Config.config;
        $scope.schema = Config.schema;

        $scope.Config = Config;

        $scope.$watch(
          function(){ return Config.config; },
          function(newConfig) {
            $scope.config = newConfig;
          }
        );

        $scope.$watch(
          function(){ return Config.schema; },
          function(newSchema) {
             $scope.schema= newSchema;
          }
        );
      }
    };
  });
