'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:visList
 * @description
 * # visList
 */
angular.module('facetedviz')
  .directive('visList', function (Fields, Visrec, vl, jQuery, consts) {
    return {
      templateUrl: 'components/vislist/vislist.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope , element /*, attrs*/) {
        scope.Fields = Fields;
        scope.Visrec = Visrec;
        scope.shorthands = vl.field.shorthands;
        scope.limit = consts.listLimit;

        scope.increaseLimit = function() {
          scope.limit+=10;
        };

        scope.select = function(fieldSet, cluster, $index) {
          Visrec.selectedFieldSet = fieldSet;
          Visrec.selectedCluster = cluster;

          var ev = jQuery(element).find('.encoding-variations').detach();

          var getChild = function(i) {
            return jQuery('.vis-list-item-group:nth-child(' + i + ')');
          };

          // off by one
          var index = $index + 1;

          var dist = getChild(index).offset().top;

          // find index of last in row
          while (getChild(index).length === 1 && getChild(index).offset().top === dist) {
            index++;
          }

          // TODO: fix location when the window is resized. We could use flexbox order to do this.

          // TODO: animate
          getChild(index-1).after(ev);
        };

        scope.$watch('Fields.fields', function(){
          scope.limit = consts.listLimit;
          var fieldList = Fields.getList();
          Visrec.update.projections(fieldList);
        }, true);
      }
    };
  });
