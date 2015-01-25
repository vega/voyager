'use strict';

angular.module('vleApp')
  .directive('functionSelect', function () {
    return {
      templateUrl: 'components/functionselect/functionselect.html',
      restrict: 'E',
      scope: {
        fieldDefSchema: '=',
        fieldDef: '='
      },
      controller: function($scope) {
        $scope.selectedAggFunc = {name: ''};

        $scope.$watch('selectedAggFunc', function(aggFunc) {
          if (!aggFunc) {
            return;
          }

          // reset field def
          $scope.fieldDef.bin = undefined;
          $scope.fieldDef.aggr = undefined;
          $scope.fieldDef.fn = undefined;

          var group = aggFunc.group,
            name = aggFunc.name;

          if (group === 'Binning') {
            $scope.fieldDef.bin = true;
          } else if (group === 'Aggregation') {
            $scope.fieldDef.aggr = name;
          } else if (group === 'Function') {
            $scope.fieldDef.fn = name;
          } else if (group !== undefined) {
            console.warn('Undefined group', aggFunc);
          }
        });

        // $scope.$watchCollection(
        //   function(){ return $scope.fieldDefSchema },
        //   function(schema) {
        //     update();
        //   }
        // );

        $scope.$watchCollection(
          function(){ return $scope.fieldDef; },
          function() { update(); }
        );

        var update = function() {
          // only run this if schema is not null
          if (!$scope.fieldDefSchema || !$scope.fieldDef) {
            return;
          }

          // if the fieldDef doesn't have a name set, we still want to allow count
          var type = $scope.fieldDef.name ? $scope.fieldDef.type : "";
          var schema = $scope.fieldDefSchema.properties;

          var functions = [{name: ""}];

          if(schema.fn && (!schema.fn.supportedTypes || schema.fn.supportedTypes[type])){
            var fns = schema.fn.enum;
            fns.forEach(function(fn){
              functions.push({
                'name': fn,
                'group': "Function"
              });
            });
          }

          // set aggregation functions
          if (schema.aggr && (!schema.aggr.supportedTypes || schema.aggr.supportedTypes[type])) {
            var aggFunctions = schema.aggr.supportedEnums ? schema.aggr.supportedEnums[type] : schema.aggr.enum;

            _.each(aggFunctions, function(aggFunc) {
              functions.push({
                name: aggFunc,
                group: 'Aggregation'
              });

              if ($scope.fieldDef.aggr) {
                $scope.selectedAggFunc = {name: $scope.fieldDef.aggr, group: 'Aggregation'};
              }
            });
          }


          // add binning function
          if (schema.bin && schema.bin.supportedTypes[type]) {
            var bin = {
              name: 'bin',
              group: 'Binning'
            };
            functions.push(bin);

            if ($scope.fieldDef.bin === true) {
              $scope.selectedAggFunc = bin;
            }
          }

          // omit nulls
          functions = _.filter(functions, function(f) {
            return f.name !== null;
          });

          // console.log(functions, schema, $scope.fieldDef, $scope.selectedAggFunc)
          $scope.functions = functions;
        };
      }
    };
  });
