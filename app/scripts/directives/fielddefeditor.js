'use strict';

angular.module('vleApp')
  .directive('fieldDefEditor', function (Dataset) {
    return {
      templateUrl: 'templates/fielddefeditor.html',
      restrict: 'E',
      scope: {
        encType: '=',
        fieldDef: '=',
        schema: '=fieldDefSchema'
      },
      link: function(scope, element, attrs){
        scope.propsExpanded = false;
        scope.funcsExpanded = false;

        scope.togglePropsExpand = function(){
          scope.propsExpanded = !scope.propsExpanded;
        };


        scope.toggleFuncsExpand = function(){
          scope.funcsExpanded = !scope.funcsExpanded;
        };

        scope.removeField = function() {
          scope.fieldDef.name = null;
          scope.fieldDef.type = null;
        };

        scope.fieldDropped = function() {
          var fieldType = Dataset.stats[scope.fieldDef.name].type;
          if (_.contains(scope.types, fieldType)) {
            scope.fieldDef.type = fieldType;
          } else if (!scope.fieldDef.type) {
            var types = scope.schema.properties.type.enum;
            scope.fieldDef.type = types[0];
          }
        };
      }
    };
  });
