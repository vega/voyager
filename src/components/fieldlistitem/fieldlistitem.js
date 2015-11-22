'use strict';

angular.module('voyager')
  .directive('fieldListItem', function(Dataset, Fields, consts) {
    return {
      templateUrl: 'components/fieldlistitem/fieldlistitem.html',
      restrict: 'E',
      replace: true,
      scope: {
        fieldDef: '='
      },
      link: function postLink (scope, element /*, attrs*/) {
        scope.consts = consts;
        scope.Fields = Fields;
        scope.popupContent = element.find('.popup-functions')[0];
      },
      controller: function($scope, Dataset) {
        $scope.stats = Dataset.stats[$scope.fieldDef.field];
      }
    };
  });
