'use strict';

/**
 * @ngdoc directive
 * @name vegalite-ui.directive:visListItem
 * @description
 * # visListItem
 */
angular.module('vleApp')
  .directive('vlPlotGroup', function (Bookmarks, consts, vl, Dataset, Drop, Logger) {

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
        expandAction: '&',

        maxHeight: '=',
        maxWidth: '=',
        overflow: '=',
        alwaysScrollable: '=',
        tooltip: '='
      },
      link: function postLink(scope, element) {
        scope.Bookmarks = Bookmarks;
        scope.consts = consts;
        scope.Dataset = Dataset;

        var toggleSort = scope.toggleSort = function(spec) {
          Logger.logInteraction(Logger.actions.SORT_TOGGLE, scope.chart.shorthand);
          vl.Encoding.toggleSort(spec);
        };
        //FIXME
        toggleSort.support = vl.Encoding.toggleSort.support;

        scope.toggleFilterNull = function(spec, stats) {
          Logger.logInteraction(Logger.actions.NULL_FILTER_TOGGLE, scope.chart.shorthand);

          vl.Encoding.toggleFilterNullO(spec, stats);
        };
        scope.toggleFilterNull.support = vl.Encoding.toggleFilterNullO.support;

        debugPopup = new Drop({
          content: element.find('.dev-tool')[0],
          target: element.find('.fa-wrench')[0],
          position: 'bottom right',
          openOn: 'click',
          constrainToWindow: true
        });

        scope.toggleSortClass = function(vlSpec) {
          var direction = vl.Encoding.toggleSort.direction(vlSpec),
            mode = vl.Encoding.toggleSort.mode(vlSpec);

          if (direction === 'y') {
            return mode === 'Q' ? 'fa-sort-amount-desc' :
              'fa-sort-alpha-asc';
          } else {
            return mode === 'Q' ? 'fa-sort-amount-desc sort-x' :
              'fa-sort-alpha-asc sort-x';
          }
        };

        scope.transpose = function() {
          Logger.logInteraction(Logger.actions.TRANSPOSE_TOGGLE, scope.chart.shorthand);
          vl.Encoding.transpose(scope.chart.vlSpec);
        };
      }
    };
  });