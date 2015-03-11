'use strict';

/**
 * @ngdoc directive
 * @name vleApp.directive:schemaListItem
 * @description
 * # schemaListItem
 */
angular.module('vleApp')
  .directive('schemaListItem', function (Pills) {
    return {
      templateUrl: 'components/schemalistitem/schemalistitem.html',
      restrict: 'E',
      replace: false,
      scope: {
        field:'='
      },
      link: function postLink(scope) {
        scope.getSchemaPill = Pills.getSchemaPill;

        scope.fieldDragStart = function() {
          scope.pill = Pills.getSchemaPill(scope.field);
        };
      }
    };
  });