'use strict';

angular.module('vleApp')
  .directive('functionSelect', function(_, vl, Pills) {
    return {
      templateUrl: 'components/functionselect/functionselect.html',
      restrict: 'E',
      scope: {
        encType: '=',
        schema: '=',
        field: '='
      },
      link: function(scope /*,element, attrs*/) {
        var BIN='bin', RAW='', COUNT='count', maxbins;

        scope.pills = Pills.pills;
        scope.func = {
          selected: RAW,
          list: [RAW]
        };

        function fieldPill() {
          return Pills ? Pills.pills[scope.encType] : null;
        }

        function getFns(type) {
          var schema = scope.schema.properties;
          if (schema.fn && (!schema.fn.supportedTypes || schema.fn.supportedTypes[type])) {
            return (schema.fn.supportedEnums ? schema.fn.supportedEnums[type] : schema.fn.enum) || [];
          }
          return [];
        }

        function getAggrs(type) {
          var schema = scope.schema.properties;
          if(!type) {
            return [COUNT];
          }

          if (schema.aggr && (!schema.aggr.supportedTypes || schema.aggr.supportedTypes[type])){
            return (schema.aggr.supportedEnums ? schema.aggr.supportedEnums[type] : schema.aggr.enum) || [];
          }
          return [];
        }

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
          pill.bin = selectedFunc === BIN ? {maxbins: maxbins || vl.schema.MAXBINS_DEFAULT} : undefined;
          pill.aggr = getAggrs(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          pill.fn = getFns(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;

          if(!_.isEqual(oldPill, pill)){
            Pills.pills[scope.encType] = pill;
            Pills.update(scope.encType);
          }
        });

        // when parent objects modify the field
        scope.$watch('field', function (pill) {
          // only run this if schema is not null
          if (!scope.schema || !pill) {
            return;
          }

          var type = pill.name ? pill.type : '';
          var schema = scope.schema.properties;

          // hack: save the maxbins
          if (pill.bin) {
            maxbins = pill.bin.maxbins;
          }

          var isOrdinalShelf = ['row','col','shape'].indexOf(scope.encType) !== -1,
            isQ = type==='Q', isT = type==='T';

          if(pill.name==='*' && pill.aggr===COUNT){
            scope.func.list=[COUNT];
            scope.func.selected = COUNT;
          } else {
            scope.func.list = ( isOrdinalShelf && (isQ||isT) ? [] : [''])
              .concat(getFns(type))
              .concat(getAggrs(type).filter(function(x) { return x !== COUNT; }))
              .concat(schema.bin && schema.bin.supportedTypes[type] ? ['bin'] : []);

            var defaultVal = (isOrdinalShelf &&
              (isQ && BIN) || (isT && vl.schema.defaultTimeFn)
            )|| RAW;

            var selected = pill.bin ? 'bin' :
              pill.aggr || pill.fn ||
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
