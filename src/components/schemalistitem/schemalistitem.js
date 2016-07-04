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
        scope.fieldDragStart = function() {
          var fieldDef = scope.fieldDef;

          scope.pill = {
            field: fieldDef.field,
            type: fieldDef.type,
            aggregate: fieldDef.aggregate
          };
          Pills.dragStart(scope.pill, null);
        };

        scope.fieldDragStop = Pills.dragStop;
      }
    };
  });