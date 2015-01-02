'use strict';

angular.module('vleApp')
  .directive('fieldDrop', function (Dataset) {
    return {
      templateUrl: 'templates/fielddrop.html',
      restrict: 'E',
      scope: {
        field: '=',
        types: '='
      },
      controller: function ($scope) {
        $scope.removeField = function() {
          $scope.field.name = null;
          $scope.field.type = null;
        };

        $scope.fieldDropped = function() {
          $scope.field.type = Dataset.stats[$scope.field.name].type;
        }
      }
    };
  });
