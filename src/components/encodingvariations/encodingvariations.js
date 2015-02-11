'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:encodingVariations
 * @description
 * # encodingVariations
 */
angular.module('facetedviz')
  .directive('encodingVariations', function (Visrec, $document) {

    return {
      templateUrl: 'components/encodingvariations/encodingvariations.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope/*, element, attrs*/) {
        scope.Visrec = Visrec;

        function escape(e) {
          console.log('escape');
          if (e.keyCode === 27) {
            scope.close();
            angular.element($document).off('keydown', escape);
          }
        }

        angular.element($document).on('keydown', escape);

        scope.close = function() {
          scope.Visrec.selectedCluster = null;
        };
      }
    };
  });
