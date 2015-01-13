'use strict';

angular.module('vleApp')
  .directive('fieldDrop', function (Dataset) {
    return {
      templateUrl: 'templates/fielddrop.html',
      restrict: 'E',
      replace: true,
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
          var fieldType = Dataset.stats[$scope.fieldDef.name].type;
          if (_.contains($scope.types, fieldType)) {
            $scope.fieldDef.type = fieldType;
          } else if (!$scope.fieldDef.type) {
            $scope.fieldDef.type = $scope.types[0];
          }
        };
      }
    };
  });
