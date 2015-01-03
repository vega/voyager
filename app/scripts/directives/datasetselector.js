'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function (Dataset) {
    return {
      templateUrl: 'templates/datasetselector.html',
      restrict: 'E',
      replace: true,
      scope: true,
      controller: function ($scope) {
        $scope.datasets = Dataset.datasets;
        $scope.dataset = Dataset.dataset;

        $scope.$watch('dataset', function(newDataset) {
          Dataset.update(newDataset);
        });
      }
    };
  });
