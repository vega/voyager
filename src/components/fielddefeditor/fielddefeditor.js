'use strict';

angular.module('polestar')
  .directive('fieldDefEditor', function(Dataset, Pills, _, Drop, Logger, vl) {
    return {
      templateUrl: 'components/fielddefeditor/fielddefeditor.html',
      restrict: 'E',
      replace: true,
      scope: {
        channel: '=',
        encoding: '=',

        schema: '=fieldDefSchema',
        marktype: '='
      },
      link: function(scope, element /*, attrs*/) {
        var propsPopup, funcsPopup;

        scope.allowedCasting = {
          quantitative: [vl.type.QUANTITATIVE, vl.type.ORDINAL, vl.type.NOMINAL],
          ordinal: [vl.type.ORDINAL, vl.type.NOMINAL],
          nominal: [vl.type.NOMINAL, vl.type.ORDINAL],
          temporal: [vl.type.TEMPORAL, vl.type.ORDINAL, vl.type.NOMINAL]
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
          Logger.logInteraction(Logger.actions.FIELD_DROP, scope.encoding[scope.channel]);
        };

        scope.$watch('encoding[channel]', function(fieldDef) {
          Pills.pills[scope.channel] = fieldDef ? _.cloneDeep(fieldDef) : {};
        }, true);

        scope.$watchGroup(['allowedCasting[Dataset.dataschema.byName[encoding[channel].field].type]', 'encoding[channel].aggregate'], function(arr){
          var allowedTypes = arr[0], aggregate=arr[1];
          scope.allowedTypes = aggregate === 'count' ? [vl.type.QUANTITATIVE] : allowedTypes;
        });


      }

    };
  });
