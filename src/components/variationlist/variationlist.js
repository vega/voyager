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
      templateUrl: 'components/variationlist/variationlist.html',
      restrict: 'E',
      scope: {},
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.Visrec = Visrec;
      }
    };
  });