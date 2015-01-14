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

        scope.fieldDragStart = function(){
          var pill = element.find('.field-drop');
          pill.css('width', pill.width()+"px");
        };


        scope.fieldDropped = function() {
          // need to clone so that original fieldDef in the schemalist is not mutated.
          scope.fieldDef = _.clone(scope.fieldDef);

          var types = scope.schema.properties.type.enum;
          if (!_.contains(types, scope.fieldDef.type)) {
            // if existing type is not supported
            scope.fieldDef.type = types[0];
          }
        };

        scope.$watch('fieldDef', function(fieldDef){
          if(!fieldDef){
            // when a field is dragged to another
            scope.removeField();
          }
        });
      }
    };
  });
