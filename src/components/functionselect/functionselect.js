'use strict';

angular.module('vleApp')
  .directive('functionSelect', function(_, vl) {
    return {
      templateUrl: 'components/functionselect/functionselect.html',
      restrict: 'E',
      scope: {
        field: '='
      },
      link: function(scope /*,element, attrs*/) {
        var BIN='bin', RAW='RAW', COUNT='count', ANY = 'any';

        scope.func = {
          selected: ANY,
          list: [ANY]
        };

        function getFns(type) {
          return type === 'T' ? vl.schema.timefns : [];
        }

        function getAggrs(type) {
          return vl.schema.aggr.supportedEnums[type];
        }

        // when the function select is updated, propagates change the parent
        scope.$watch('func.selected', function(selectedFunc) {
          var field = scope.field,
            type = field ? field.type : '';

          if(!field){
            return; // not ready
          }

          field._bin = selectedFunc === BIN || undefined;
          field._aggr = getAggrs(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          field._fn = getFns(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          field._raw = selectedFunc === RAW || undefined;

        });

        scope.$watch('field', function (field) {
          // only run this if schema is not null
          if (!field) {
            return;
          }

          var type = field.name ? field.type : '';

          if(vl.field.isCount(field)){
            scope.func.list=[COUNT];
            scope.func.selected = COUNT;
          } else {
            scope.func.list = (type === 'O' ? [ANY] : [ANY, RAW])
              .concat(getFns(type))
              .concat(getAggrs(type).filter(function(x) { return x !== COUNT; }))
              .concat(type ==='Q' ? [BIN] : []);

            scope.func.selected = field._bin ? BIN :
              field._raw ? RAW :
              field._aggr || field._fn || ANY;
          }

        }, true);
      }
    };
  });
