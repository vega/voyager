'use strict';

/**
 * @ngdoc directive
 * @name vleApp.directive:fieldInfo
 * @description
 * # fieldInfo
 */
angular.module('vleApp')
  .directive('fieldInfo', function (Dataset, Drop) {
    return {
      templateUrl: 'components/fieldinfo/fieldinfo.html',
      restrict: 'E',
      replace: true,
      scope: {
        field: '=',
        showType: '=',
        showInfo: '=',
        showCaret: '=',
        popupContent: '=',
        showRemove: '=',
        removeAction: '&',
        action: '&'
      },
      link: function(scope, element) {
        var funcsPopup;

        scope.typeNames = Dataset.typeNames;
        scope.stats = Dataset.stats[scope.field.name];

        scope.clicked = function($event){
          if(scope.action && $event.target !== element.find('.fa-caret-down')[0]) {
            scope.action($event);
          }
        };

        scope.$watch('popupContent', function(popupContent) {
          if (!popupContent) { return; }

          funcsPopup = new Drop({
            content: popupContent,
            target: element.find('.caret')[0],
            position: 'bottom left',
            openOn: 'click'
          });
        });
      },
      controller: function($scope, Dataset) {
        var statsField = $scope.field.aggr === 'count' ? 'count' : $scope.field.name;
        $scope.stats = Dataset.stats[statsField];
      }
    };
  });