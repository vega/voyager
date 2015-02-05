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
      /**
       * List of all recommended projections based on the selection.
       * Array of fieldSet (Array of Field without transformation)
       * projections = [ fieldSet (without aggr) ]
       */
      projections: [],

      /**
       * Dictionary: projection key => a list of aggregated table
       * aggregates[pkey] = [ fieldSet (with aggr) ]
       */
      aggregates: {},

      /**
       * Dictionary: field set key (fields of an aggregated table)  => list of fieldSets
       * fieldSetDict[fieldSetKey] = fieldSet
       */
      fieldSetDict: {},

      /**
       * ordered list of field sets
       */
      fieldSets: [],

      /**
       * ordered list of field set keys
       */
      fieldSetKeys: [],

      /**
       * Clustered Encoding variations of each field set
       *
       * Dictionary: field set key => list of list of spec
       * encodings[fieldSetkey] = [[ (vlSpec, vgSpec) ,...], ...]
       */
      chartClusters: {},

      selectedCluster: null,
      selectedFieldSet: null,
      update: {}
    };

    // Visrec Config

    Visrec.opt = {
      // genAggr: true,
      // genBin: true,
      genTypeCasting: false,
      // omitTranpose: true,
      // omitDotPlotWithExtraEncoding: false,
      // omitAggrWithAllDimsOnFacets: false,
      omitDimensionOnly: true,
      // omitAggregateWithMeasureOnly: true
    };


    Visrec.update.projections = function(fieldList) {
      // TODO decide if we can update projections only if field name list changes

      // First create a projection
      var projections = vr.gen.projections(fieldList, Visrec.opt);
      var aggregates = {}, fieldSetDict = {},
        fieldSets = [], chartClusters={};

      // For each projection, get different aggregations (fieldSetDict)
      projections.forEach(function(projection) {
        var pkey = projection.key;
        aggregates[pkey] = vr.gen.aggregates([], projection, Visrec.opt);

        aggregates[pkey].forEach(function(fieldSet) {
          fieldSetDict[fieldSet.key] = fieldSet;
          fieldSets.push(fieldSet);
        });
      });


      // For each fieldSet, get encoding vairations
      _.each(fieldSetDict, function(fieldSet, fieldSetKey) {
        var encodings = vr.gen.encodings([], fieldSet, Dataset.stats, Visrec.opt, Config.config);

        var clusterIndices = vr.cluster(encodings, 2.5)
          .map(function (cluster) {
            // rank item in each cluster
            return cluster.sort(function (i, j) {
              return encodings[j].score - encodings[i].score;
            });
          })
          .filter(function(cluster) {
            return cluster.length > 0;
          })
          .sort(function (c1, c2) {
            // rank cluster by top item in each cluster
            return encodings[c2[0]].score - encodings[c1[0]].score;
          });

          chartClusters[fieldSetKey] =  clusterIndices.map(function(indices) {
            return indices.map(function(index) {
              var spec = encodings[index],
                encoding = vl.Encoding.fromSpec(spec, {
                  enc: {alpha: {value: 0.1}}
                });

              return {
                vlSpec: spec,
                vgSpec: vl.compile(encoding, Dataset.stats)
              };
            });
          });
      });

      Visrec.projections = projections;
      Visrec.aggregates = aggregates;
      Visrec.fieldSetDict = fieldSetDict;
      Visrec.fieldSets = fieldSets;
      Visrec.chartClusters = chartClusters;
    };
    return Visrec;
  });
