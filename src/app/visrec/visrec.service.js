'use strict';

/**
 * @ngdoc service
 * @name voyager.visrec
 * @description
 * # visrec
 * Service in the voyager.
 */
angular.module('voyager')
  .service('Visrec', function (cp, vl, _, consts, Config, Dataset, Logger, Fields) {
    var Visrec = {
      /**
       * List of all recommended projections based on the selection.
       * Array of fieldSet (Array of Field without transformation)
       * projections = [ fieldSet (without aggregate) ]
       */
      projections: [],

      /**
       * Dictionary: projection key => a list of aggregated table
       * aggregates[pkey] = [ fieldSet (with aggregate) ]
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

    var exactMatchOpt = {
      genTypeCasting: false,
    };

    var initOpt = {
      genTypeCasting: false,
      maxCardinalityForAutoAddOrdinal: null,
      omitDotPlot: true
    };

    var suggestionOpt = {
      genTypeCasting: false,
      // addCountForDimensionOnly: false
    };

    Visrec.update.projections = function(fieldList) {
      var start = new Date().getTime();
      // TODO decide if we can update projections only if field name list changes

      // First create a projection

      var projections = cp.gen.projections(fieldList, Dataset.stats,
        {} || (Fields.selected.length === 0 ? initOpt : suggestionOpt));

      var aggregates = {}, fieldSetDict = {},
        fieldSets = [], chartClusters = {};

      var endProjection = new Date().getTime();

      // For each projection, get different aggregations (fieldSetDict)
      projections.forEach(function(projection) {
        var pkey = projection.key;
        var isExactMatch = pkey === Fields.selectedPKey;
        var opt =  isExactMatch ? exactMatchOpt :  Fields.selected.length === 0 ? initOpt : suggestionOpt;

        aggregates[pkey] = cp.gen.aggregates([], projection, Dataset.stats, opt);

        aggregates[pkey].forEach(function(fieldSet) {
          fieldSetDict[fieldSet.key] = fieldSet;
          fieldSet.isExactMatch = isExactMatch;
          fieldSets.push(fieldSet);
        });
      });

      // TODO rank fieldSets here!

      var endAggregates = new Date().getTime();

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

      var selectedFields = fieldList.filter(function(f) {
        return f.selected;
      });

      console.log('gen time – projections ', vl.encDef.shorthands(selectedFields), ' :', (endProjection-start), 'aggregates:', (endAggregates - endProjection), 'encodings:'+ (end-endAggregates), 'total:', (end-start));
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

        Visrec.numClustersGenerated = limit;
      }
    };

    function genClusters(fieldSet) {
      var encodings = cp.gen.specs([], fieldSet, Dataset.stats, {
        data: Config.getData(),
        config: Config.getConfig()
      });

      var clusters = cp.cluster(encodings)
        .map(function(cluster) {
          return cluster.map(function(spec) {
            var encoding = vl.Encoding.fromSpec(spec, {});

            return {
              fieldSetKey: fieldSet.key,
              fieldSet: fieldSet,
              vlSpec: spec,
              encoding: encoding,
              shorthand: encoding.toShorthand(),
              score: spec.score,
              scoreFeatures: spec.scoreFeatures
            };
          });
        });

      clusters.key = fieldSet.key;
      return clusters;
    }



    return Visrec;
  });
