'use strict';

/**
 * @ngdoc directive
 * @name vegalite-ui.directive:detailsPopup
 * @description
 * # detailsPopup
 */
angular.module('vleApp')
  .directive('detailsPopup', function (Tooltip) {
    return {
      restrict: 'A',
      scope: {
        fieldName: "=name"
      },
      link: function postLink(scope, element, attrs) {
        scope.drop = new Tooltip({
          target: element.get(0),
          content: 'Name ' + scope.fieldName,
          position: 'right',
          attach: 'right middle'
        });
      }
    };
  });