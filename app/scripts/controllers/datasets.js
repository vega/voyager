'use strict';

angular.module('vleApp')
  .controller('DatasetsCtrl', function ($scope, Config, Dataset) {
    $scope.datasets = Dataset.datasets;
    $scope.dataset = Dataset.dataset;

    $scope.Dataset = Dataset;

    $scope.$watch('dataset', function(newVal, oldVal) {
      Dataset.update(newVal);
    });
});
