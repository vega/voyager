'use strict';

angular.module('vleApp')
  .directive('functionSelect', function () {
    return {
      templateUrl: 'templates/functionselect.html',
      restrict: 'E',
      scope: {
        fieldDefSchema: '=',
        fieldDef: '='
      },
      controller: function($scope) {
        // TODO: no propagation from model to ui (for aggr and bin in fieldDef)
        $scope.selectedAggFunc = {name: ""};

        // $scope.$watchCollection(
        //   function(){ return $scope.fieldDefSchema },
        //   function(schema) {
        //     update();
        //   }
        // );

        $scope.$watchCollection(
          function(){ return $scope.fieldDef },
          function(fieldDef) {
            update();
          }
        );

        $scope.$watch('selectedAggFunc', function(aggFunc) {
          if (!aggFunc) {
            return;
          }

          // reset field def
          $scope.fieldDef.bin = undefined;
          $scope.fieldDef.aggr = undefined;

          var group = aggFunc.group,
            name = aggFunc.name;

          if (group === 'Binning') {
            $scope.fieldDef.bin = true;
          } else if (group === 'Aggregation') {
            $scope.fieldDef.aggr = name;
          } else if (group !== undefined) {
            console.warn('Undefined group', aggFunc);
          }
        });

        var update = function() {
          // only run this if schema is not null
          if (!$scope.fieldDefSchema || !$scope.fieldDef) {
            return;
          }

          // if the fieldDef doesn't have a name set, we still want to allow count
          var type = $scope.fieldDef.name ? $scope.fieldDef.type : "";
          var schema = $scope.fieldDefSchema.properties;

          var functions = [{name: ""}];

          // set aggregation functions
          if (schema.aggr && (!schema.aggr.supportedEnums || type in schema.aggr.supportedEnums)) {
            var aggFunctions = schema.aggr.supportedEnums ? schema.aggr.supportedEnums[type] : schema.aggr.enum;
            // console.log($scope.fieldDefSchema)

            _.each(aggFunctions, function(aggFunc) {
              functions.push({
                name: aggFunc,
                group: 'Aggregation'
              });
            });
          }

          // add binning function
          if (schema.bin && _.contains(schema.bin.supportedTypes, type)) {
            functions.push({
              name: 'bin',
              group: 'Binning'
            });
          };

          // omit nulls
          functions = _.filter(functions, function(f) {
            return f.name !== null;
          });

          // console.log(functions, schema, $scope.fieldDef, $scope.selectedAggFunc)
          $scope.functions = functions;
        }
      }
    };
  });
