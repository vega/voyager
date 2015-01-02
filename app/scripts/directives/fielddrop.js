'use strict';

angular.module('vleApp')
  .directive('fieldDrop', function (Dataset) {
    return {
      templateUrl: 'templates/fielddrop.html',
      restrict: 'E',
      scope: {
        fieldDef: '=',
        types: '='
      },
      controller: function ($scope) {
        $scope.removeField = function() {
          $scope.fieldDef.name = null;
          $scope.fieldDef.type = null;
        };

        $scope.fieldDropped = function() {
          $scope.fieldDef.type = Dataset.stats[$scope.fieldDef.name].type;
        }
      }
    };
  });
