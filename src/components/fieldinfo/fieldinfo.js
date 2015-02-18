'use strict';

/**
 * @ngdoc directive
 * @name vegalite-ui.directive:fieldInfo
 * @description
 * # fieldInfo
 */
angular.module('vegalite-ui')
  .directive('fieldInfo', function (Dataset) {
    return {
      templateUrl: 'components/fieldinfo/fieldinfo.html',
      restrict: 'E',
      replace: true,
      scope: {
        field: '=',
        showType: '=',
        showInfo: '=',
        showCaret: '=',
        caretAction: '&',
        showRemove: '=',
        removeAction: '&',
        action: '&'
      },
      link: function(scope) {
        scope.typeNames = Dataset.typeNames;
        scope.stats = Dataset.stats[scope.field.name];

        scope.caretClicked = function($event) {
          if(scope.caretAction) {
            scope.caretAction();
          }
          $event.stopPropagation();
        };
      },
      controller: function($scope, Dataset) {
        var statsField = $scope.field.aggr === 'count' ? 'count' : $scope.field.name;
        $scope.stats = Dataset.stats[statsField];
      }
    };
  });