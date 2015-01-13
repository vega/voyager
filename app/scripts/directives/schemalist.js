'use strict';

angular.module('vleApp')
  .directive('schemaList', function (Dataset) {
    return {
      templateUrl: 'templates/schemalist.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.fieldDragStart = function(){
          var pill = element.find('.field-pill');
          pill.css('width', pill.width()+"px");
        }

        scope.fieldDragStop = function(){
          var pill = element.find('.field-pill');
          pill.css('width', null);
        }
      },
      controller: function ($scope) {
        $scope.schema = Dataset.schema;

        $scope.$watch(
          function(){ return Dataset.schema; },
          function(newSchema) {
            $scope.schema = newSchema;
          }
        );

      }
    };
  });
