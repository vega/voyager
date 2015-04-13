'use strict';

/**
 * @ngdoc directive
 * @name polestar.directive:bookmarkList
 * @description
 * # bookmarkList
 */
angular.module('polestar')
  .directive('bookmarkList', function (Bookmarks, consts) {
    return {
      templateUrl: 'components/bookmarklist/bookmarklist.html',
      restrict: 'E',
      replace: true,
      scope: {
        active:'=',
        deactivate: '&',
        highlighted: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.Bookmarks = Bookmarks;
        scope.consts = consts;
      }
    };
  });