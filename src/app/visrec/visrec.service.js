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
      aggregates: {},
      chartClusters: [],
      update: {}
    };

    Visrec.update.projections = function(fieldList) {
      Visrec.projections = vr.gen.projections(fieldList);
      Visrec.aggregates = Visrec.projections.reduce(function(a, p) {
        var key = p.key;
        a[key] = vr.gen.aggregates([], p);
        return a;
      });

    };


    return Visrec;
  });
