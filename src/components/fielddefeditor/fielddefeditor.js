'use strict';

angular.module('vleApp')
  .directive('fieldDefEditor', function(Dataset, Logger, _, Tether) {
    return {
      templateUrl: 'components/fielddefeditor/fielddefeditor.html',
      restrict: 'E',
      scope: {
        encType: '=',
        enc: '=',
        pills: '=',
        schema: '=fieldDefSchema'
      },
      link: function(scope, element /*, attrs*/) {
        var propsPopup, funcsPopup;
        scope.propsExpanded = false;
        scope.funcsExpanded = false;

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

        scope.togglePropsExpand = function() {
          scope.propsExpanded = !scope.propsExpanded;
          if (scope.propsExpanded) {
            if (scope.funcsExpanded) {
              scope.toggleFuncsExpand();
            }
            if (propsPopup) {
              propsPopup.enable();
            } else {
              propsPopup = new Tether({
                element: element.find('.shelf-properties'),
                target: element.find('.shelf'),
                attachment: 'top left',
                targetAttachment: 'bottom left'
              });
            }
          } else { // detach
            if (propsPopup) {
              propsPopup.disable();
            }
          }
        };

        scope.toggleFuncsExpand = function() {
          scope.funcsExpanded = !scope.funcsExpanded;
          if (scope.funcsExpanded) {
            if (scope.propsExpanded) {
              scope.togglePropsExpand();
            }
            if (funcsPopup) {
              funcsPopup.enable();
            } else {
              funcsPopup = new Tether({
                element: element.find('.shelf-functions'),
                target: element.find('.field-pill'),
                attachment: 'top left',
                targetAttachment: 'bottom left'
              });
            }
          } else {
            if (funcsPopup) {
              funcsPopup.disable();
            }
          }
        };

        scope.removeField = function() {
          scope.pills.remove(scope.encType);
        };

        scope.fieldDragStart = function() {
          var pillElem = element.find('.field-drop');
          pillElem.css('width', pillElem.width() + 'px');

          scope.pills.dragStart(scope.encType);
        };

        scope.fieldDropped = function() {
          var pill = fieldPill();

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
