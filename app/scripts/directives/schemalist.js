'use strict';

angular.module('vleApp')
  .directive('schemaList', function () {
    return {
      templateUrl: 'templates/schemalist.html',
      restrict: 'E',
      controller: function ($scope, Dataset) {
		    $scope.schema = Dataset.schema;

		    $scope.$watch(
	        function(){ return Dataset.schema },
	        function(newSchema) {
	          $scope.schema = newSchema;
	        }
	      );
    	}
    };
  });
