'use strict';

angular.module('vleApp')
  .controller('DatasetsCtrl', function ($scope, Config, Dataset) {
    $scope.datasets = Dataset.getDatasets();
    $scope.myDataset = Dataset.getMyDataset();

    $scope.useServer = Config.useVegaServer;

    var myDataset = $scope.$watchAsProperty('myDataset');

    myDataset
      .changes()
      .onValue(function(v) {
        console.log(v);
      })

    myDataset
      .changes()
      .toProperty()
      .digest($scope, 'schema');
  });
