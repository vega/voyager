'use strict';

/**
 * @ngdoc directive
 * @name vegalite-ui.directive:visListItem
 * @description
 * # visListItem
 */
angular.module('vleApp')
  .directive('vlPlotGroup', function (Bookmarks, consts, vl, Dataset, Drop) {

    var debugPopup;

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

        showLabel: '@',

        configSet: '@',
        alwaysSelected: '=',
        isSelected: '=',
        highlighted: '=',
        expandAction: '&'
      },
      link: function postLink(scope, element) {
        scope.Bookmarks = Bookmarks;
        scope.consts = consts;
        scope.Dataset = Dataset;

        var toggleSort = scope.toggleSort = vl.Encoding.toggleSort;
        scope.toggleFilterNull = vl.Encoding.toggleFilterNullO;

        debugPopup = new Drop({
          content: element.find('.dev-tool')[0],
          target: element.find('.fa-wrench')[0],
          position: 'bottom right',
          openOn: 'click',
          constrainToWindow: true
        });

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