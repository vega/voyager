'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:fieldList
 * @description
 * # fieldList
 */
angular.module('facetedviz')
  .directive('fieldList', function (Dataset, Fields) {
    return {
      templateUrl: 'components/fieldlist/fieldlist.html',
      restrict: 'E',
      scope: {},
      link: function postLink (scope /*, element, attrs*/) {
        scope.Dataset = Dataset;
        scope.$watch('Dataset.dataschema', function(dataschema) {
          Fields.updateSchema(dataschema);
        });
      }
    };
  });