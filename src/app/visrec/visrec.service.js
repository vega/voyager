'use strict';

/**
 * @ngdoc service
 * @name facetedviz.visrec
 * @description
 * # visrec
 * Service in the facetedviz.
 */
angular.module('facetedviz')
  .service('Visrec', function (vr, vl, _, consts, Config, Dataset) {
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
      numClustersGenerated: 0,

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
      var start = new Date().getTime();
      // TODO decide if we can update projections only if field name list changes

      // First create a projection
      var projections = vr.gen.projections(fieldList, Visrec.opt);

      var aggregates = {}, fieldSetDict = {},
        fieldSets = [], chartClusters = {};

      var endProjection = new Date().getTime();
      console.log('gen projections', (endProjection-start));

      // For each projection, get different aggregations (fieldSetDict)
      projections.forEach(function(projection) {
        var pkey = projection.key;
        aggregates[pkey] = vr.gen.aggregates([], projection, Visrec.opt);

        aggregates[pkey].forEach(function(fieldSet) {
          fieldSetDict[fieldSet.key] = fieldSet;
          fieldSets.push(fieldSet);
        });
      });

      // TODO rank fieldSets here!

      var endAggregates = new Date().getTime();
      console.log('gen aggregates', (endAggregates - endProjection));

      Visrec.numClustersGenerated = Math.min(consts.numInitClusters, fieldSets.length);
      for(var i=0; i< Visrec.numClustersGenerated; i++) {
        var fieldSet = fieldSets[i];
        chartClusters[fieldSet.key] = genClusters(fieldSet);
      }


      Visrec.projections = projections;
      Visrec.aggregates = aggregates;
      Visrec.fieldSetDict = fieldSetDict;
      Visrec.fieldSets = fieldSets;
      Visrec.chartClusters = chartClusters;

      var end = new Date().getTime();
      console.log('gen encodings '+ (end-endAggregates));
      console.log('Visrec.update took '+ (end-start));
    };

    Visrec.update.clusters = function(limit) {
      if (limit > Visrec.numClustersGenerated) {

        var fieldSets = Visrec.fieldSets,
          oldnum = Visrec.numClustersGenerated,
          chartClusters = Visrec.chartClusters;

        limit = Math.min(limit, fieldSets.length);

        for (var i=oldnum; i< limit ; i++) {
          var fieldSet = fieldSets[i];
          chartClusters[fieldSet.key] = genClusters(fieldSet);
        }

        Visrec.numClustersGenerated = newnum;
      }
    };

    function genClusters(fieldSet) {
      var encodings = vr.gen.encodings([], fieldSet, Dataset.stats, Visrec.opt, Config.config);

      // get 2d array of indices
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

      // transform 2d array of indices into 2d array of spec/encodings
      var cluster = clusterIndices.map(function(indices) {
        return indices.map(function(index) {
          var spec = encodings[index],
            encoding = vl.Encoding.fromSpec(spec);

          var vgSpec= vl.compile(encoding, Dataset.stats);

          return {
            vlSpec: spec,
            encoding: encoding,
            vgSpec: vgSpec
          };
        });
      });

      return cluster;
    }



    return Visrec;
  });
