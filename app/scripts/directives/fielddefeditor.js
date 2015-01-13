'use strict';

angular.module('vleApp')
  .directive('fieldDefEditor', function () {
    return {
      templateUrl: 'templates/fielddefeditor.html',
      restrict: 'E',
      scope: {
        encType: '=',
        fieldDef: '=',
        schema: '=fieldDefSchema'
      },
      link: function(scope, element, attrs){
        scope.expanded = false;

        scope.toggleExpand = function(){
          scope.expanded = !scope.expanded;
          console.log("toggle expand", scope.expanded);
        };
      }
    };
  });
