'use strict';

/**
 * @ngdoc directive
 * @name vleApp.directive:nullFilterDirective
 * @description
 * # nullFilterDirective
 */
angular.module('vleApp')
  .directive('nullFilterDirective', function (Spec) {
    return {
      templateUrl: 'components/nullfilterdirective/nullfilterdirective.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.Spec = Spec;

        scope.updateFilter = function() {
          Spec.update();
        }
      }
    };
  });