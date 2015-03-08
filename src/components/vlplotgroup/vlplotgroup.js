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

        var toggleSort = scope.toggleSort = vl.Encoding.toggleSort;
        scope.toggleFilterNull = vl.Encoding.toggleFilterNullO;

        scope.toggleSortClass = function(vlSpec) {
          var direction = toggleSort.direction(vlSpec),
            mode = toggleSort.mode(vlSpec);
          if (direction === 'y') {
            return mode === 'Q' ? 'fa-sort-amount-desc' :
              'fa-sort-alpha-asc';
          } else {
            return mode === 'Q' ? 'fa-sort-amount-desc sort-x' :
              'fa-sort-alpha-asc sort-x';
          }
        };

        scope.transpose = function() {
          vl.Encoding.transpose(scope.chart.vlSpec);
        };
      }
    };
  });