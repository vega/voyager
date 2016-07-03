'use strict';

angular.module('voyager')
  .directive('functionList', function(_, vl, Logger, Schema) {
    return {
      templateUrl: 'components/functionlist/functionlist.html',
      restrict: 'E',
      scope: {
        fieldDef: '='
      },
      link: function(scope /*,element, attrs*/) {
        var BIN='bin', RAW='raw', COUNT='count', ANY = 'AUTO';

        scope.func = {
          selected: ANY,
          list: [ANY]
        };

        function getTimeUnits(type) {
          return type === vl.type.TEMPORAL ? vl.timeUnit.TIMEUNITS : [];
        }

        function getAggrs(type) {
          if (type === 'quantitative' ){
            return Schema.schema.definitions.AggregateOp.enum;
          }
          return [];
        }

        // when the function select is updated, propagates change the parent
        scope.functionChanged = function(selectedFunc) {
          var fieldDef = scope.fieldDef,
            type = fieldDef ? fieldDef.type : '';

          if (!fieldDef) {
            return; // not ready
          }

          fieldDef._bin = selectedFunc === BIN || undefined;
          fieldDef._aggregate = getAggrs(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          fieldDef._timeUnit = getTimeUnits(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          fieldDef._raw = selectedFunc === RAW || undefined;
          fieldDef._any = selectedFunc === ANY || undefined;

          Logger.logInteraction(Logger.actions.FUNC_CHANGE, selectedFunc);
        };

        scope.$watch('fieldDef', function (fieldDef) {
          // only run this if schema is not null
          if (!fieldDef) {
            return;
          }

          var type = fieldDef.field ? fieldDef.type : '';

          if (vl.fieldDef.isCount(fieldDef)) {
            scope.func.list=[COUNT];
            scope.func.selected = COUNT;
          } else {
            var isO = type === vl.type.ORDINAL;
            scope.func.list = ( isO ? [RAW] : [ANY, RAW])
              .concat(getTimeUnits(type))
              .concat(getAggrs(type).filter(function(x) { return x !== COUNT; }))
              .concat(type === vl.type.QUANTITATIVE ? [BIN] : []);

            scope.func.selected = fieldDef._bin ? BIN :
              fieldDef._raw ? RAW :
              fieldDef._aggregate || fieldDef._timeUnit || ( isO ? RAW : ANY );
          }

        }, true);
      }
    };
  });
