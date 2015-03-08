'use strict';

angular.module('facetedviz')
  .directive('fieldListItem', function(Dataset, Fields) {
    return {
      templateUrl: 'components/fieldlistitem/fieldlistitem.html',
      restrict: 'E',
      replace: true,
      scope: {
        field: '='
      },
      link: function postLink (scope, element /*, attrs*/) {
        scope.typeNames = Dataset.typeNames;
        scope.Fields = Fields;
        scope.popupContent = element.find('.popup-functions')[0];
      },
      controller: function($scope, Dataset) {
        $scope.stats = Dataset.stats[$scope.field.name];
      }
    };
  });
