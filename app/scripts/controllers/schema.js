'use strict';

angular.module('vleApp')
  .controller('SchemaCtrl', function ($scope, Dataset) {
    $scope.Dataset = Dataset;
  });
