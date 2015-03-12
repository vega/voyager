'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:visList
 * @description
 * # visList
 */
angular.module('facetedviz')
  .directive('visList', function (Fields, Visrec, vl, jQuery, consts, _, Logger) {
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
          Logger.logInteraction(Logger.actions.LOAD_MORE, scope.limit);
        };

        scope.select = function(fieldSet, cluster/*, $index*/) {
          Logger.logInteraction(Logger.actions.DRILL_DOWN_OPEN, fieldSet.key);
          Visrec.selectedFieldSet = fieldSet;
          Visrec.selectedCluster = cluster;
        };

        function updateFields() {
          scope.limit = consts.numInitClusters;
          element.scrollTop(0); // scroll the the top
          var fieldList = Fields.getList();

          Fields.update();
          Logger.logInteraction(Logger.actions.FIELDS_CHANGE, {
            selected: Fields.selected,
            list: fieldList
          });
          Visrec.update.projections(fieldList);
        }

        var dUpdateFields = _.debounce(updateFields, 200, {maxWait: 1500});

        scope.$watch('Fields.fields', function(fields, oldFields) {
          if (!oldFields || _.keys(oldFields).length ===0 ) { // first time!
            updateFields();
          } else {
            dUpdateFields();
          }
        }, true);

      }
    };
  });
