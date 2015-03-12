'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function(Dataset, Config, Fields, Logger) {
    return {
      templateUrl: 'components/datasetselector/datasetselector.html',
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function($scope) {
        $scope.Dataset = Dataset;

        $scope.datasetChanged = function() {
          var dataset = Dataset.dataset;

          Logger.logInteraction(Logger.actions.DATASET_CHANGE, dataset.name);

          Dataset.update(dataset).then(function() {
            Config.updateDataset(dataset);
            Fields.updateSchema(Dataset.dataschema);
          });
        };
      }
    };
  });
