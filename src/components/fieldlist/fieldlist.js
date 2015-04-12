'use strict';

/**
 * @ngdoc directive
 * @name voyager.directive:fieldList
 * @description
 * # fieldList
 */
angular.module('voyager')
  .directive('fieldList', function (Dataset, Fields) {
    return {
      templateUrl: 'components/fieldlist/fieldlist.html',
      restrict: 'E',
      scope: {},
      link: function postLink (scope /*, element, attrs*/) {
        scope.Dataset = Dataset;
        scope.Fields = Fields;
      }
    };
  });
