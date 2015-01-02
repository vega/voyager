'use strict';

angular.module('vleApp')
  .directive('fieldDefEditor', function () {
    return {
      templateUrl: 'templates/fielddefeditor.html',
      restrict: 'E',
      link: function(scope, element, attrs) {
        console.log("field def")
      }
    };
  });
