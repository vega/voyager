'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function () {
    return {
      templateUrl: 'templates/datasetselector.html',
      restrict: 'E',
      controller: function ($scope, Dataset) {
		    $scope.datasets = Dataset.datasets;
		    $scope.dataset = Dataset.dataset;

		    $scope.$watch('dataset', function(newVal, oldVal) {
		      Dataset.update(newVal);
		    });
    	}
    }
  });
