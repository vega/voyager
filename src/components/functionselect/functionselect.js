'use strict';

angular.module('polestar')
  .directive('functionSelect', function(_, consts, vl, Pills, Logger) {
    return {
      templateUrl: 'components/functionselect/functionselect.html',
      restrict: 'E',
      scope: {
        channel: '=',
        schema: '=',
        fieldDef: '='
      },
      link: function(scope /*,element, attrs*/) {
        var BIN='bin', RAW='', COUNT='count', maxbins;

        scope.pills = Pills.pills;
        scope.func = {
          selected: RAW,
          list: [RAW]
        };

        function fieldPill() {
          return Pills ? Pills.pills[scope.channel] : null;
        }

        function getFns(type) {
          var schema = (scope.schema || {}).properties;
          if (schema && schema.timeUnit && (!schema.timeUnit.supportedTypes || schema.timeUnit.supportedTypes[type])) {
            return (schema.timeUnit.supportedEnums ? schema.timeUnit.supportedEnums[type] : schema.timeUnit.enum) || [];
          }
          return [];
        }

        function getAggrs(type) {
          if(!type) {
            return [COUNT];
          }

          var schema = scope.schema.properties;

          if (schema && schema.aggregate && (!schema.aggregate.supportedTypes || schema.aggregate.supportedTypes[type])){
            return (schema.aggregate.supportedEnums ? schema.aggregate.supportedEnums[type] : schema.aggregate.enum) || [];
          }
          return [];
        }

        scope.selectChanged = function() {
          Logger.logInteraction(Logger.actions.FUNC_CHANGE, scope.func.selected);
        };

        // FIXME func.selected logic should be all moved to selectChanged
        // when the function select is updated, propagates change the parent
        scope.$watch('func.selected', function(selectedFunc) {
          var oldPill = fieldPill(),
            pill = _.clone(oldPill),
            type = pill ? pill.type : '';

          if(!pill){
            return; // not ready
          }

          // reset field def
          // HACK: we're temporarily storing the maxbins in the pill
          pill.bin = selectedFunc === BIN ? {maxbins: maxbins || vl.bin.MAXBINS_DEFAULT} : undefined;
          pill.aggregate = getAggrs(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          pill.timeUnit = getFns(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;

          if(!_.isEqual(oldPill, pill)){
            Pills.pills[scope.channel] = pill;
            Pills.update(scope.channel);
          }
        });

        // when parent objects modify the field
        scope.$watch('fieldDef', function(pill) {
          // only run this if schema is not null
          if (!scope.schema || !pill) {
            return;
          }

          var type = pill.field ? pill.type : '';
          var schema = scope.schema.properties;

          // hack: save the maxbins
          if (pill.bin) {
            maxbins = pill.bin.maxbins;
          }

          var isOrdinalShelf = ['row','column','shape'].indexOf(scope.channel) !== -1,
            isQ = type === vl.type.QUANTITATIVE,
            isT = type === vl.type.TEMPORAL;

          if(pill.field === '*' && pill.aggregate === COUNT){
            scope.func.list=[COUNT];
            scope.func.selected = COUNT;
          } else {
            scope.func.list = ( isOrdinalShelf && (isQ || isT) ? [] : [''])
              .concat(getFns(type))
              .concat(getAggrs(type).filter(function(x) { return x !== COUNT; }))
              .concat(schema.bin && schema.bin.supportedTypes[type] ? ['bin'] : []);

            var defaultVal = (isOrdinalShelf &&
              (isQ && BIN) || (isT && consts.defaultTimeFn)
            )|| RAW;

            var selected = pill.bin ? 'bin' :
              pill.aggregate || pill.timeUnit ||
              defaultVal;

            if (scope.func.list.indexOf(selected) >= 0) {
              scope.func.selected = selected;
            } else {
              scope.func.selected = defaultVal;
            }

          }
        }, true);
      }
    };
  });
