'use strict';

angular.module('polestar')
  .directive('fieldDefEditor', function(Dataset, Pills, _, Drop, Logger, vl, Schema) {
    return {
      templateUrl: 'components/fielddefeditor/fielddefeditor.html',
      restrict: 'E',
      replace: true,
      scope: {
        channel: '=',
        encoding: '=',
        mark: '='
      },
      link: function(scope, element /*, attrs*/) {
        var propsPopup, funcsPopup;

        // TODO(https://github.com/vega/vega-lite-ui/issues/187):
        // consider if we can use validator / cql instead
        scope.allowedCasting = {
          quantitative: [vl.type.QUANTITATIVE, vl.type.ORDINAL, vl.type.NOMINAL],
          ordinal: [vl.type.ORDINAL, vl.type.NOMINAL],
          nominal: [vl.type.NOMINAL, vl.type.ORDINAL],
          temporal: [vl.type.TEMPORAL, vl.type.ORDINAL, vl.type.NOMINAL]
        };

        scope.Dataset = Dataset;
        scope.schema = Schema.getChannelSchema(scope.channel);

        scope.pills = Pills.pills;

        scope.vl = vl;

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

        /**
         * Event handler for dropping pill.
         */
        scope.fieldDropped = function() {
          var pill = Pills.get(scope.channel);
          if (funcsPopup) {
            funcsPopup = null;
          }

          // validate type
          var types = Schema.schema.definitions.Type.enum;
          if (!_.includes(types, pill.type)) {
            // if existing type is not supported
            pill.type = types[0];
          }

          // TODO validate timeUnit / aggregate

          Pills.dragDrop(scope.channel);
          Logger.logInteraction(Logger.actions.FIELD_DROP, scope.encoding[scope.channel]);
        };

        scope.$watch('encoding[channel]', function(fieldDef) {
          Pills.set(scope.channel, fieldDef ? _.cloneDeep(fieldDef) : {});
        }, true);

        scope.$watchGroup(['allowedCasting[Dataset.dataschema.byName[encoding[channel].field].type]', 'encoding[channel].aggregate'], function(arr){
          var allowedTypes = arr[0], aggregate=arr[1];
          scope.allowedTypes = aggregate === 'count' ? [vl.type.QUANTITATIVE] : allowedTypes;
        });


      }

    };
  });
