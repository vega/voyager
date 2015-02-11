'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:encodingVariations
 * @description
 * # encodingVariations
 */
angular.module('facetedviz')
  .directive('encodingVariations', function (Visrec, Bookmarks, $document) {

    return {
      templateUrl: 'components/encodingvariations/encodingvariations.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope/*, element, attrs*/) {
        scope.Visrec = Visrec;
        scope.Bookmarks = Bookmarks;

        function escape(e) {

          if (e.keyCode === 27) {
            console.log('escape');
            scope.close();
            angular.element($document).off('keydown', escape);
          }
        }

        angular.element($document).on('keydown', escape);

        scope.close = function() {
          console.log('close');
          scope.Visrec.selectedCluster = null;
        };
      }
    };
  });
