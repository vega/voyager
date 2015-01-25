'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function (Dataset) {
    return {
      templateUrl: 'components/datasetselector/datasetselector.html',
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function ($scope) {
        $scope.datasets = Dataset.datasets;
        $scope.dataset = Dataset.dataset;

        $scope.$watch('dataset', function(newDataset) {
          Dataset.update(newDataset);
        });
      }
    };
  });
