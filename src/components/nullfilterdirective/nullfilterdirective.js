'use strict';

/**
 * @ngdoc directive
 * @name vleApp.directive:nullFilterDirective
 * @description
 * # nullFilterDirective
 */
angular.module('vleApp')
  .directive('nullFilterDirective', function (Spec, Config) {
    return {
      templateUrl: 'components/nullfilterdirective/nullfilterdirective.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.Config = Config;

        scope.updateFilter = function() {
          Spec.update();
        };
      }
    };
  });