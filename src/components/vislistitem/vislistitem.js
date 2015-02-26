'use strict';

/**
 * @ngdoc directive
 * @name vegalite-ui.directive:visListItem
 * @description
 * # visListItem
 */
angular.module('vleApp')
  .directive('visListItem', function (Bookmarks, consts) {
    return {
      templateUrl: 'components/vislistitem/vislistitem.html',
      restrict: 'E',
      replace: true,
      scope: {
        chart: '=',
        fieldSet: '=', //optional
        isSelected: '=', //optional
        highlighted: '=', //optional
        showExpand: '=', //optional
        expandAction: '&' //optional
      },
      link: function postLink(scope, element, attrs) {
        scope.Bookmarks = Bookmarks;
        scope.consts = consts;
      }
    };
  });