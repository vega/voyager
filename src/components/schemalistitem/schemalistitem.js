'use strict';

/**
 * @ngdoc directive
 * @name polestar.directive:schemaListItem
 * @description
 * # schemaListItem
 */
angular.module('polestar')
  .directive('schemaListItem', function (Pills) {
    return {
      templateUrl: 'components/schemalistitem/schemalistitem.html',
      restrict: 'E',
      replace: false,
      scope: {
        fieldDef:'='
      },
      link: function postLink(scope) {
        scope.getSchemaPill = Pills.getSchemaPill;

        scope.fieldDragStart = function() {
          scope.pill = Pills.getSchemaPill(scope.fieldDef);
          Pills.dragStart(scope.pill, null);
        };

        scope.fieldDragStop = Pills.dragStop;
      }
    };
  });