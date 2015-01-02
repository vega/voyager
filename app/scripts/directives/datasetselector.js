'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function (Dataset) {
    return {
      templateUrl: 'templates/datasetselector.html',
      restrict: 'E',
      link: function (scope, element, attrs) {
		    scope.datasets = Dataset.datasets;
		    scope.dataset = Dataset.dataset;

		    scope.$watch('dataset', function(newVal, oldVal) {
		      Dataset.update(newVal);
		    });
    	}
    }
  });
