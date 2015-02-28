'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:visList
 * @description
 * # visList
 */
angular.module('facetedviz')
  .directive('visList', function (Fields, Visrec, vl, jQuery, consts, _) {
    return {
      templateUrl: 'components/vislist/vislist.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope , element /*, attrs*/) {
        scope.Fields = Fields;
        scope.Visrec = Visrec;
        scope.consts = consts;
        scope.shorthands = vl.field.shorthands;
        scope.limit = consts.numInitClusters;

        scope.increaseLimit = function() {
          if(scope.limit + consts.numMoreClusters > Visrec.numClustersGenerated) {
            Visrec.update.clusters(scope.limit + consts.numMoreClusters);
          }

          scope.limit += consts.numMoreClusters;
        };

        scope.select = function(fieldSet, cluster/*, $index*/) {
          Visrec.selectedFieldSet = fieldSet;
          Visrec.selectedCluster = cluster;

          // var ev = jQuery(element).find('.encoding-variations').clone();

          // var getChild = function(i) {
          //   return jQuery('.vis-list-item-group:nth-child(' + i + ')');
          // };

          // // off by one
          // var index = $index + 1;

          // var dist = getChild(index).offset().top;

          // // find index of last in row
          // while (getChild(index).length === 1 && getChild(index).offset().top === dist) {
          //   index++;
          // }

          // // TODO: fix location when the window is resized. We could use flexbox order to do this.

          // // TODO: animate
          // getChild(index-1).after(ev);
        };

        var updateFields = _.debounce(function() {
          console.log('updateFields');
          scope.limit = consts.numInitClusters;
          element.scrollTop(0); // scroll the the top
          var fieldList = Fields.getList();
          Fields.update();
          Visrec.update.projections(fieldList);

        }, 200, {maxWait: 1500});

        scope.$watch('Fields.fields', updateFields, true);
      }
    };
  });
