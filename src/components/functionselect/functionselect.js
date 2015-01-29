'use strict';

angular.module('vleApp')
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
        scope.selectedAggFunc = {name: ''};

        function fieldPill(){
          return scope.pills ? scope.pills[scope.encType] : null;
        }

        // when the function select is updated, propagates change the parent
        scope.$watch('selectedAggFunc', function(aggFunc) {
          var oldPill = fieldPill(),
            pill = _.clone(oldPill);

          if(!pill){
            return; // not ready
          }

          // reset field def
          pill.bin = undefined;
          pill.aggr = undefined;
          pill.fn = undefined;

          var group = aggFunc.group,
            name = aggFunc.name;

          if (group === 'Binning') {
            pill.bin = true;
          } else if (group === 'Aggregation') {
            pill.aggr = name;
          } else if (group === 'Function') {
            pill.fn = name;
          }
          if(!_.isEqual(oldPill, pill)){
            scope.pills[scope.encType] = pill;
            // console.log('selectedAggFunc updated', pill);
            scope.pills.update(scope.encType);
          }
        });

        // when parent objects modify the pill
        scope.$watch('pills[encType]', pillUpdated, true);

        function pillUpdated() {
          // only run this if schema is not null
          var pill = fieldPill();

          if (!scope.schema || !pill) {
            // console.log('schema', scope.schema, 'pill', pill, 'pills', scope.pills, 'encType', scope.encType);
            return;
          }

          var type = pill.name ? pill.type : '';
          var schema = scope.schema.properties;

          var functions = [{name: ''}], selectedAggFunc={name:''};

          if (schema.fn && (!schema.fn.supportedTypes || schema.fn.supportedTypes[type])) {
            var fns = schema.fn.enum;
            fns.forEach(function(fn) {
              functions.push({
                'name': fn,
                'group': 'Function'
              });
            });

            if (pill.fn) {
              selectedAggFunc = {name: pill.fn, group: 'Aggregation'};
            }
          }

          // set aggregation functions
          if (schema.aggr && (!schema.aggr.supportedTypes || schema.aggr.supportedTypes[type])) {
            var aggFunctions = schema.aggr.supportedEnums ? schema.aggr.supportedEnums[type] : schema.aggr.enum;

            _.each(aggFunctions, function(aggFunc) {
              functions.push({
                name: aggFunc,
                group: 'Aggregation'
              });

            });

            if (pill.aggr) {
              selectedAggFunc = {name: pill.aggr, group: 'Aggregation'};
            }
          }

          // add binning function
          if (schema.bin && schema.bin.supportedTypes[type]) {
            var bin = {
              name: 'bin',
              group: 'Binning'
            };
            functions.push(bin);

            if (pill.bin === true) {
              selectedAggFunc = bin;
            }
          }

          // omit nulls
          functions = _.filter(functions, function(f) {
            return f.name !== null;
          });

          scope.functions = functions;
          // console.log('pillUpdated', pill, selectedAggFunc);
          scope.selectedAggFunc = selectedAggFunc;
        }
      }
    };
  });
