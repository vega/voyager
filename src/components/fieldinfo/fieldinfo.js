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
        action: '&',
        disableCountOrOCaret: '='
      },
      link: function(scope, element) {
        var funcsPopup;

        scope.typeNames = Dataset.typeNames;
        scope.stats = Dataset.stats[scope.field.name];

        scope.clicked = function($event){
          console.log($event);
          if(scope.action && $event.target !== element.find('.fa-caret-down')[0]
            && $event.target !== element.find('span.type')[0]) {
            scope.action($event);
          }
        };

        scope.func = function(field) {
          return field.aggr || field.fn ||
            (field.bin && 'bin') ||
            field._aggr || field._fn ||
            (field._bin && 'bin') || (field._any && '*');
        };

        scope.$watch('popupContent', function(popupContent) {
          if (!popupContent) { return; }

          funcsPopup = new Drop({
            content: popupContent,
            target: element.find('.type-caret')[0],
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