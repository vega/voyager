'use strict';

angular.module('voyager')
  .directive('functionList', function(_, vl, Logger) {
    return {
      templateUrl: 'components/functionlist/functionlist.html',
      restrict: 'E',
      scope: {
        field: '='
      },
      link: function(scope /*,element, attrs*/) {
        var BIN='bin', RAW='raw', COUNT='count', ANY = 'AUTO';

        scope.func = {
          selected: ANY,
          list: [ANY]
        };

        function getTimeUnits(type) {
          return type === 'T' ? vl.schema.timeUnits : [];
        }

        function getAggrs(type) {
          return vl.schema.aggregate.supportedEnums[type];
        }

        // when the function select is updated, propagates change the parent
        scope.functionChanged = function(selectedFunc) {
          var field = scope.field,
            type = field ? field.type : '';

          if (!field) {
            return; // not ready
          }

          field._bin = selectedFunc === BIN || undefined;
          field._aggregate = getAggrs(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          field._timeUnit = getTimeUnits(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          field._raw = selectedFunc === RAW || undefined;
          field._any = selectedFunc === ANY || undefined;

          Logger.logInteraction(Logger.actions.FUNC_CHANGE, selectedFunc);
        };

        scope.$watch('field', function (field) {
          // only run this if schema is not null
          if (!field) {
            return;
          }

          var type = field.name ? field.type : '';

          if (vl.field.isCount(field)) {
            scope.func.list=[COUNT];
            scope.func.selected = COUNT;
          } else {
            var isO = type==='O';
            scope.func.list = ( isO ? [RAW] : [ANY, RAW])
              .concat(getTimeUnits(type))
              .concat(getAggrs(type).filter(function(x) { return x !== COUNT; }))
              .concat(type ==='Q' ? [BIN] : []);

            scope.func.selected = field._bin ? BIN :
              field._raw ? RAW :
              field._aggregate || field._timeUnit || ( isO ? RAW : ANY );
          }

        }, true);
      }
    };
  });
