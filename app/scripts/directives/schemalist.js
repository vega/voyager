'use strict';

angular.module('vleApp')
  .directive('schemaList', function (Dataset) {
    return {
      templateUrl: 'templates/schemalist.html',
      restrict: 'E',
      link: function (scope, element, attrs) {
		    scope.schema = Dataset.schema;

		    scope.$watch(
	        function(){ return Dataset.schema },
	        function(newSchema) {
	          scope.schema = newSchema;
	        }
	      );
    	}
    };
  });
