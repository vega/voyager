'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:variationList
 * @description
 * # variationList
 */
angular.module('facetedviz')
  .directive('variationList', function (Visrec) {
    return {
      templateUrl: 'components/variationList/variationList.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.Visrec = Visrec;
      }
    };
  });