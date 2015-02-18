'use strict';

angular.module('vegalite-ui')
  .directive('functionSelect', function(_) {
    return {
      templateUrl: 'components/functionselect/functionselect.html',
      restrict: 'E',
      scope: {
        encType: '=',
        pills: '=',
        schema: '='
      },
      link: function(scope /*,element, attrs*/) {
        var BIN='bin', RAW='', COUNT='count';

        scope.func = {
          selected: RAW,
          list: [RAW]
        };

        function fieldPill() {
          return scope.pills ? scope.pills[scope.encType] : null;
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
          pill.bin = selectedFunc === BIN ? true : undefined;
          pill.aggr = getAggrs(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;
          pill.fn = getFns(type).indexOf(selectedFunc) !== -1 ? selectedFunc : undefined;

          if(!_.isEqual(oldPill, pill)){
            scope.pills[scope.encType] = pill;
            scope.pills.update(scope.encType);
          }
        });

        // when parent objects modify the pill
        scope.$watch('pills[encType]', function (pill) {
          // only run this if schema is not null
          if (!scope.schema || !pill) {
            return;
          }

          var type = pill.name ? pill.type : '';
          var schema = scope.schema.properties;

          var isQonOrdinalOnlyShelf = ['row','col','shape'].indexOf(scope.encType) !== -1 && type==='Q';

          if(pill.name==='*' && pill.aggr===COUNT){
            scope.func.list=[COUNT];
            scope.func.selected = COUNT;
          } else {
            scope.func.list = (isQonOrdinalOnlyShelf ? [] : [''])
              .concat(getFns(type))
              .concat(getAggrs(type).filter(function(x) { return x !== COUNT; }))
              .concat(schema.bin && schema.bin.supportedTypes[type] ? ['bin'] : []);

            scope.func.selected = pill.bin ? 'bin' :
              pill.aggr || pill.fn ||
              (isQonOrdinalOnlyShelf ? BIN : RAW);
          }

        }, true);
      }
    };
  });
