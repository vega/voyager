'use strict';

angular.module('vleApp')
  .directive('fieldDefEditor', function (Dataset) {
    return {
      templateUrl: 'components/fielddefeditor/fielddefeditor.html',
      restrict: 'E',
      scope: {
        encType: '=',
        fieldDef: '=',
        schema: '=fieldDefSchema'
      },
      link: function(scope, element /*, attrs*/){
        scope.propsExpanded = false;
        scope.funcsExpanded = false;
        scope.field = null;
        scope.typeNames = Dataset.typeNames;

        scope.togglePropsExpand = function(){
          scope.propsExpanded = !scope.propsExpanded;
        };

        scope.toggleFuncsExpand = function(){
          scope.funcsExpanded = !scope.funcsExpanded;
        };

        scope.removeField = function() {
          scope.fieldDef.name = undefined;
          scope.fieldDef.type = undefined;
          scope.field = null;
        };

        scope.fieldDragStart = function(){
          var pill = element.find('.field-drop');
          pill.css('width', pill.width()+"px");
        };


        scope.fieldDropped = function() {
          // need to clone so that original fieldDef in the schemalist is not mutated.
          scope.field = _.clone(scope.field);

          scope.fieldDef.name = scope.field.name;

          var types = scope.schema.properties.type.enum;
          if (!_.contains(types, scope.field.type)) {
            // if existing type is not supported
            scope.fieldDef.type = types[0];
          }else {
            scope.fieldDef.type = scope.field.type;
          }
        };

        scope.$watch('fieldDef', function(fieldDef){
          console.log('fieldDef updated', scope.encType, fieldDef);
          scope.field = {
            name: fieldDef.name,
            type: fieldDef.type
          };
        });

        scope.$watch('field', function(field){
          if(!field){
            // after a field has been dragged to another field
            scope.fieldDef.name = undefined;
            scope.fieldDef.type = undefined;
          }
        });
      }
    };
  });
