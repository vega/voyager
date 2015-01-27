'use strict';

angular.module('vleApp')
  .directive('configurationEditor', function() {
    return {
      templateUrl: 'components/configurationeditor/configurationeditor.html',
      restrict: 'E',
      scope: {},
      controller: function($scope, Config) {
        $scope.Config = Config;
      }
    };
  });
