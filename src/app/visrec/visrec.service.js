'use strict';

/**
 * @ngdoc service
 * @name facetedviz.visrec
 * @description
 * # visrec
 * Service in the facetedviz.
 */
angular.module('facetedviz')
  .service('Visrec', function (vr, _) {
    var Visrec = {
      projections: [],
      tables: [],
      chartClusters: [],
      update: {}
    };

    function projectionKey(projection){
      return _.pluck(projection, 'name').join(',');
    }

    Visrec.update.projections = function(fieldList) {
      Visrec.projections = vr.gen.projections(fieldList);
      console.log('Visrec.gen.projections', Visrec.projections);
    };


    return Visrec;
  });
