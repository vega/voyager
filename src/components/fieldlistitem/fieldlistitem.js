'use strict';

angular.module('facetedviz')
  .directive('fieldListItem', function(Dataset, Fields) {
    return {
      templateUrl: 'components/fieldlistitem/fieldlistitem.html',
      restrict: 'E',
      scope: {
        field: '='
      },
      link: function postLink (scope /*, element, attrs*/) {
        scope.typeNames = Dataset.typeNames;
        scope.Fields = Fields;
      }
    };
  });
