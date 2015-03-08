'use strict';

/**
 * @ngdoc directive
 * @name vegalite-ui.directive:visListItem
 * @description
 * # visListItem
 */
angular.module('vleApp')
  .directive('vlPlotGroup', function (Bookmarks, consts, vl) {
    return {
      templateUrl: 'components/vlplotgroup/vlplotgroup.html',
      restrict: 'E',
      replace: true,
      scope: {
        chart: '=',
        //optional
        fieldSet: '=',

        showBookmark: '@',
        showDebug: '=',
        showExpand: '=',
        showFilterNull: '@',
        showMarkType: '@',
        showSort: '@',
        showTranspose: '@',

        configSet: '@',
        alwaysSelected: '=',
        isSelected: '=',
        highlighted: '=',
        expandAction: '&'
      },
      link: function postLink(scope) {
        scope.Bookmarks = Bookmarks;
        scope.consts = consts;

        scope.toggleSort = vl.Encoding.toggleSort;
        scope.toggleFilterNull = vl.Encoding.toggleFilterNullO;


        scope.transpose = function() {
          vl.Encoding.transpose(scope.chart.vlSpec);
        };
      }
    };
  });