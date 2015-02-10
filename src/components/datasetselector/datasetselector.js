'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function(Dataset, Config, Fields) {
    return {
      templateUrl: 'components/datasetselector/datasetselector.html',
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function($scope) {
        $scope.Dataset = Dataset;

        $scope.datasetChanged = function() {
          var dataset = Dataset.dataset;

          Dataset.update(dataset).then(function() {
            Config.updateDataset(dataset);
            Fields.updateSchema(Dataset.dataschema);
          });
        };
      }
    };
  });
