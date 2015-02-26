'use strict';

/**
 * @ngdoc directive
 * @name vleApp.directive:bookmarkList
 * @description
 * # bookmarkList
 */
angular.module('vleApp')
  .directive('bookmarkList', function (Bookmarks) {
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
      }
    };
  });