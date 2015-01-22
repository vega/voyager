'use strict';

angular.module('vleApp')
  .directive('schemaList', function (Dataset) {
    return {
      templateUrl: 'templates/schemalist.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element /*, attrs*/) {
        // On drag, copy static value of the dynamically set width to the dragged ghost.
        scope.fieldDragStart = function(){
          var pill = element.find('.field-pill');
          pill.css('width', pill.width()+"px");
        };

      },
      controller: function ($scope) {
        $scope.schema = null;
        $scope.stats = null;

        $scope.$watch(
          function(){ return Dataset.schema; },
          function(newSchema) {
            $scope.schema = newSchema;
            $scope.stats = Dataset.stats;
          }
        );

      }
    };
  });
