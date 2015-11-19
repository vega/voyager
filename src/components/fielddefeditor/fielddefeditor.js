'use strict';

angular.module('polestar')
  .directive('fieldDefEditor', function(Dataset, Pills, _, Drop, Logger, vl) {
    return {
      templateUrl: 'components/fielddefeditor/fielddefeditor.html',
      restrict: 'E',
      replace: true,
      scope: {
        channel: '=',
        enc: '=',

        schema: '=fieldDefSchema',
        marktype: '='
      },
      link: function(scope, element /*, attrs*/) {
        var propsPopup, funcsPopup;

        var Type = vl.Type;


        scope.allowedCasting = {
          quantitative: [Type.QUANTITATIVE, Type.ORDINAL, Type.NOMINAL],
          ordinal: [Type.ORDINAL, Type.NOMINAL],
          nominal: [Type.NOMINAL, Type.ORDINAL],
          temporal: [Type.TEMPORAL, Type.ORDINAL, Type.NOMINAL]
        };

        scope.Dataset = Dataset;

        scope.pills = Pills.pills;

        function fieldPill(){
          return Pills.pills[scope.channel];
        }

        propsPopup = new Drop({
          content: element.find('.shelf-properties')[0],
          target: element.find('.shelf-label')[0],
          position: 'bottom left',
          openOn: 'click'
        });

        scope.fieldInfoPopupContent =  element.find('.shelf-functions')[0];

        scope.removeField = function() {
          Pills.remove(scope.channel);
        };

        scope.fieldDragStart = function() {
          Pills.dragStart(Pills[scope.channel], scope.channel);
        };

        scope.fieldDragStop = function() {
          Pills.dragStop();
        };

        scope.fieldDropped = function() {
          var pill = fieldPill();
          if (funcsPopup) {
            funcsPopup = null;
          }

          // validate type
          var types = scope.schema.properties.type.enum;
          if (!_.contains(types, pill.type)) {
            // if existing type is not supported
            pill.type = types[0];
          }

          // TODO validate timeUnit / aggregate

          Pills.dragDrop(scope.channel);
          Logger.logInteraction(Logger.actions.FIELD_DROP, scope.enc[scope.channel]);
        };

        scope.$watch('enc[channel]', function(fieldDef) {
          Pills.pills[scope.channel] = fieldDef ? _.cloneDeep(fieldDef) : {};
        }, true);

        scope.$watchGroup(['allowedCasting[Dataset.dataschema.byName[enc[channel].name].type]', 'enc[channel].aggregate'], function(arr){
          var allowedTypes = arr[0], aggregate=arr[1];
          scope.allowedTypes = aggregate === 'count' ? [Type.QUANTITATIVE] : allowedTypes;
        });


      }

    };
  });
