'use strict';

angular.module('vleApp')
  .controller('DatasetsCtrl', function ($scope, Config, Dataset) {
    $scope.datasets = Dataset.getDatasets();
    $scope.myDataset = Dataset.getMyDataset();

    $scope.useServer = Config.useVegaServer;
});
