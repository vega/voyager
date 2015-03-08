'use strict';

angular.module('vleApp')
  .directive('fieldDefEditor', function(Dataset, Logger, _, Drop) {
    return {
      templateUrl: 'components/fielddefeditor/fielddefeditor.html',
      restrict: 'E',
      replace: true,
      scope: {
        encType: '=',
        enc: '=',
        pills: '=',
        schema: '=fieldDefSchema',
        marktype: '='
      },
      link: function(scope, element /*, attrs*/) {
        var propsPopup, funcsPopup;

        scope.allowedCasting = {
          Q: ['Q', 'O'],
          O: ['O'],
          T: ['T', 'O'],
          G: ['G', 'O']
        };

        scope.Dataset = Dataset;
        scope.typeNames = Dataset.typeNames;

        function fieldPill(){
          return scope.pills ? scope.pills[scope.encType] : null;
        }


        propsPopup = new Drop({
          content: element.find('.shelf-properties')[0],
          target: element.find('.shelf-label')[0],
          position: 'bottom left',
          openOn: 'click'
        });

        scope.fieldInfoPopupContent =  element.find('.shelf-functions')[0];

        scope.removeField = function() {
          scope.pills.remove(scope.encType);
        };

        scope.fieldDragStart = function() {
          scope.pills.dragStart(scope.encType);
        };

        scope.fieldDropped = function() {
          var pill = fieldPill();
          if (funcsPopup) {
            funcsPopup = null;
          }

          Logger.logInteraction('Field dropped: ' + pill.name);

          // validate type
          var types = scope.schema.properties.type.enum;
          if (!_.contains(types, pill.type)) {
            // if existing type is not supported
            pill.type = types[0];
          }

          // TODO validate fn / aggr

          scope.pills.dragDrop(scope.encType);
        };

        // when each of the fieldPill property in fieldDef changes, update the pill
        ['name', 'type', 'aggr', 'bin', 'fn'].forEach( function(prop) {
          scope.$watch('enc[encType].'+prop, function(val){
            var pill = fieldPill();
            if(pill && val !== pill[prop]){
              pill[prop] = val;
            }
          }, true);
        });

        scope.$watchGroup(['allowedCasting[Dataset.dataschema.byName[enc[encType].name].type]', 'enc[encType].aggr'], function(arr){
          var allowedTypes = arr[0], aggr=arr[1];
          scope.allowedTypes = aggr === 'count' ? ['Q'] : allowedTypes;
        });


      }

    };
  });
