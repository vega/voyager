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
      link: function (scope, element, attrs) {
        scope.removeField = function() {
          scope.field.name = null;
        };

        scope.fieldDropped = function() {
          console.log("dropped");
          scope.field.type = Dataset.stats[scope.field.name].type;
        }
      }
    };
  });
