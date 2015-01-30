'use strict';

angular.module('vleApp')
  .directive('schemaList', function(Dataset) {
    return {
      templateUrl: 'components/schemalist/schemalist.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element /*, attrs*/) {
        // On drag, copy static value of the dynamically set width to the dragged ghost.
        scope.fieldDragStart = function() {
          var pill = element.find('.field-pill');
          pill.css('width', pill.width() + 'px');
        };

        var typeOrder = {
          text: 0,
          geo: 1,
          time: 2,
          numbers: 3
        }

        scope.fieldOrder = function(field) {
          return typeOrder[Dataset.typeNames[field.type]] + "_" + field.name;
        }

      },
      controller: function($scope) {
        $scope.Dataset = Dataset;
        $scope.typeNames = Dataset.typeNames;
      }
    };
  });
