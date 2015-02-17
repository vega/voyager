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
        showCaret: '=',
        showInfo: '=',
        action: '&',
        caretAction: '&'
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
        $scope.stats = Dataset.stats[$scope.field.name];
      }
    };
  });