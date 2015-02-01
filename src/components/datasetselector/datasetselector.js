'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function(Dataset, Config) {
    return {
      templateUrl: 'components/datasetselector/datasetselector.html',
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function($scope) {
        $scope.Dataset = Dataset;

        $scope.$watch('Dataset.dataset', function(dataset) {
          Dataset.update(dataset);
          Config.updateDataset(dataset);
        });
      }
    };
  });
