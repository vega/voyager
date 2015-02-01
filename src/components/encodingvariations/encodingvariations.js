'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:encodingVariations
 * @description
 * # encodingVariations
 */
angular.module('facetedviz')
  .directive('encodingVariations', function (Visrec) {
    return {
      templateUrl: 'components/encodingVariations/encodingVariations.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope/*, element, attrs*/) {
        scope.Visrec = Visrec;

        scope.close = function() {
          scope.Visrec.selectedCluster = null;
        }
      }
    };
  });
