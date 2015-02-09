'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function(Dataset, Config, Spec, Logger) {
    return {
      templateUrl: 'components/datasetselector/datasetselector.html',
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function($scope) {
        $scope.Dataset = Dataset;

        $scope.$watch('Dataset.dataset', function(dataset) {
          Logger.logInteraction("Dataset changed to: " + dataset.name);

          Dataset.update(dataset);
          Config.updateDataset(dataset);
          Spec.reset();
        });
      }
    };
  });
