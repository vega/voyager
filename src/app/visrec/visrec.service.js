'use strict';

/**
 * @ngdoc service
 * @name facetedviz.visrec
 * @description
 * # visrec
 * Service in the facetedviz.
 */
angular.module('facetedviz')
  .service('Visrec', function (vr, vl, _, Config, Dataset) {
    var Visrec = {
      // projections = [ fieldSet ]
      projections: [],
      // aggregates[pkey] = [ fieldSet ]
      aggregates: {},
      aggregateKeys: [],

      // chartClusters[akey]
      chartClusters: {},

      selectedCluster: null,
      update: {}
    };

    // Visrec Config

    Visrec.opt = {
      genAggr: true,
      genBin: true,
      genTypeCasting: false,
      omitTranpose: false,
      omitDotPlotWithExtraEncoding: false,
      omitAggrWithAllDimsOnFacets: false,
      omitDimensionOnly: true,
      omitAggregateWithMeasureOnly: true
    };


    Visrec.update.projections = function(fieldList) {
      // TODO decide if we can update projections only if field name list changes
      Visrec.projections = vr.gen.projections(fieldList, Visrec.opt);
      // console.log('projections', Visrec.projections);

      Visrec.aggregates = Visrec.projections.reduce(function(a, p) {
        var key = p.key;
        a[key] = vr.gen.aggregates([], p, Visrec.opt);
        return a;
      }, {});


      Visrec.chartClusters = _.reduce(Visrec.aggregates, function(c, fieldSets, pkey) {

        c = fieldSets.reduce(function(cp, fieldSet) {

          // FIXME restructure this part of code

          var encodings = vr.gen.encodings([], fieldSet, Visrec.opt, Config.config);

          var clusterIndices = vr.cluster(encodings, 2.5)
            .map(function (cluster) {
              // rank item in each cluster
              return cluster.sort(function (i, j) {
                return encodings[j].score - encodings[i].score;
              });
            })
            .sort(function (c1, c2) {
              // rank cluster by top item in each cluster
              return encodings[c2[0]].score - encodings[c1[0]].score;
            });

          cp[fieldSet.key] =  clusterIndices.map(function(indices) {
            return indices.map(function(index) {
              var spec = encodings[index],
                encoding = vl.Encoding.fromSpec(spec);

              return {
                vlSpec: spec,
                vgSpec: vl.compile(encoding, Dataset.stats)
              };
            });
          });
          return cp;
        }, c);

        return c;
      }, {});
      Visrec.aggregateKeys = _.keys(Visrec.chartClusters);

      // console.log(Visrec.chartClusters);
    };


    return Visrec;
  });
