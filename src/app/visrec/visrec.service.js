'use strict';

/**
 * @ngdoc service
 * @name facetedviz.visrec
 * @description
 * # visrec
 * Service in the facetedviz.
 */
angular.module('facetedviz')
  .service('Visrec', function (vr, vl, _) {
    var Visrec = {
      // projections = [ fieldSet ]
      projections: [],
      // aggregates[pkey] = [ fieldSet ]
      aggregates: {},
      // chartClusters[pkey][akey]
      chartClusters: {},
      opt: {},
      update: {}
    };

    Visrec.update.projections = function(fieldList) {
      // TODO decide if we can update projections only if field name list changes
      Visrec.projections = vr.gen.projections(fieldList);
      // console.log('projections', Visrec.projections);

      Visrec.aggregates = Visrec.projections.reduce(function(a, p) {
        var key = p.key;
        a[key] = vr.gen.aggregates([], p);
        return a;
      }, {});
      // console.log('aggregates', Visrec.aggregates);

      Visrec.chartClusters = _.reduce(Visrec.aggregates, function(c, fieldSets, pkey) {

        c[pkey] = fieldSets.reduce(function(cp, fieldSet) {
          cp[fieldSet.key] = vr.gen.encodings([], fieldSet, Visrec.opt, /*cfg*/ {});
          // console.log('pkey:', pkey, 'akey:', fieldSet.key);
          return cp;
        }, {});

        return c;
      }, {});
      // console.log(Visrec.chartClusters);
    };


    return Visrec;
  });
