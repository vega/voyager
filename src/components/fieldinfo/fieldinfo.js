'use strict';

/**
 * @ngdoc directive
 * @name vleApp.directive:fieldInfo
 * @description
 * # fieldInfo
 */
angular.module('vleApp')
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

        scope.func = function(field) {
          return field.aggr || field.fn ||
            (field.bin && 'bin') ||
            field._aggr || field._fn ||
            (field._bin && 'bin') || (field._any && '*');
        };

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