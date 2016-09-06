'use strict';

angular.module('voyager2')
  .service('Alternatives', function (ANY, vl, cql, util, Chart, Dataset) {
    var Alternatives = {
      alternativeEncodings: alternativeEncodings,
      summarize: summarize,
      disaggregate: disaggregate,
      addCategoricalField: addCategoricalField,
      addQuantitativeField: addQuantitativeField,
      addTemporalField: addTemporalField,
      histograms: histograms,

      getHistograms: getHistograms,
      getAlternatives: getAlternatives
    };

    // TODO: import these from CQL once we export them!
    var GROUP_BY_SIMILAR_ENCODINGS = [
      cql.property.Property.FIELD,
      cql.property.Property.AGGREGATE,
      cql.property.Property.BIN,
      cql.property.Property.TIMEUNIT,
      cql.property.Property.TYPE,
      {
        property: cql.property.Property.CHANNEL,
        replace: {
          'x': 'xy', 'y': 'xy',
          'color': 'style', 'size': 'style', 'shape': 'style', 'opacity': 'style',
          'row': 'facet', 'column': 'facet'
        }
      }
    ];

    var GROUP_BY_SIMILAR_DATA_AND_TRANSFORM = [
      cql.property.Property.FIELD,
      cql.property.Property.AGGREGATE,
      cql.property.Property.BIN,
      cql.property.Property.TIMEUNIT,
      cql.property.Property.TYPE,
    ];

    function getHistograms(query, chart, topItem) {
      var alternative = {
        type: 'histograms',
        title: 'Univariate Summaries',
        limit: 20,
        query: histograms(query)
      };
      return [
        util.extend(alternative, {
          charts: executeQuery(alternative, chart, topItem)
        })
      ];
    }

    function getAlternatives(query, chart, topItem) {
      var isAggregate = cql.query.spec.isAggregate(query.spec);

      var alternativeTypes = [];

      var hasT = false;
      query.spec.encodings.forEach(function(encQ) {
        if (encQ.type === vl.type.TEMPORAL) {
          hasT = true;
        }
      });

      var spec = chart.vlSpec;
      var hasOpenPosition = !spec.encoding.x || !spec.encoding.y;
      var hasStyleChannel = spec.encoding.color || spec.encoding.size || spec.encoding.shape || spec.encoding.opacity;
      var hasOpenFacet = !spec.encoding.row || !spec.encoding.column;

      if (!isAggregate) {
        alternativeTypes.push({
          type: 'summarize',
          title: 'Summaries',
          filterGroupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM,
          limit: 2
        });
      }

      if (hasOpenPosition) {
        alternativeTypes.push({
          type: 'addQuantitativeField',
          title: 'Add Quantitative Field'
        });
      }

      if (hasOpenPosition || !hasStyleChannel) {
        alternativeTypes.push({
          type: 'addCategoricalField',
          title: 'Add Categorical Field'
        });
      }

      if (!hasOpenPosition && !hasStyleChannel) {
        alternativeTypes.push({
          type: 'addQuantitativeField',
          title: 'Add Quantitative Field'
        });
      }

      if (!hasT && hasOpenPosition) {
        alternativeTypes.push({
          type: 'addTemporalField',
          title: 'Add Temporal Field'
        });
      }

      alternativeTypes.push({
        type: 'alternativeEncodings',
        title: 'Alternative Encodings',
        filterGroupBy: GROUP_BY_SIMILAR_ENCODINGS
      });

      if (!(hasOpenPosition || !hasStyleChannel) && hasOpenFacet) {
        alternativeTypes.push({
          type: 'addCategoricalField',
          title: 'Add Categorical Field'
        });
      }

      // if (isAggregate) {
      //   alternativeTypes.push({
      //     type: 'summarize',
      //     title: 'Summaries',
      //     filterGroupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM
      //   });

      //   alternativeTypes.push({
      //     type: 'disaggregate',
      //     title: 'Disaggregate'
      //   });
      // }

      return alternativeTypes.map(function(alternative) {
        alternative.query = Alternatives[alternative.type](query);
        alternative.charts = executeQuery(alternative, chart, topItem);
        return alternative;
      });
    }

    function executeQuery(alternative, mainChart, mainTopItem) {
      var output = cql.query(alternative.query, Dataset.schema);

      // Don't include the specified visualization in the recommendation list
      return output.result.items
        .filter(function(item) {
          var topItem = item.getTopSpecQueryModel();
          return !mainChart || !mainChart.shorthand ||(
            topItem.toShorthand(alternative.filterGroupBy) !==
            mainTopItem.toShorthand(alternative.filterGroupBy)
          );
        })
        .map(Chart.getChart);
    }

    function makeEnumSpec(val) {
      return cql.enumSpec.isEnumSpec(val) ? val : cql.enumSpec.SHORT_ENUM_SPEC;
    }

    /**
     * Namespace for template methods for making a new SpecQuery
     */
    function alternativeEncodings(query) {
      var newSpecQ = util.duplicate(query.spec);
      newSpecQ.mark = makeEnumSpec(newSpecQ.mark);
      newSpecQ.encodings.forEach(function (encQ) {
        encQ.channel = makeEnumSpec(encQ.channel);
      });
      // TODO: extend config
      return {
        spec: newSpecQ,
        groupBy: 'encoding',
        // fieldOrder, aggregationQuality should be the same, since we have similar fields and aggregates
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness']
      };
    }

    function summarize(query) {
      var newSpecQ = util.duplicate(query.spec);

      // Make mark an enum spec
      newSpecQ.mark = makeEnumSpec(newSpecQ.mark);

      // For convert encoding for summary
      newSpecQ.encodings = newSpecQ.encodings.reduce(function (encodings, encQ) {
        // encQ.channel = makeEnumSpec(encQ.channel);
        if (cql.enumSpec.isEnumSpec(encQ.type)) {
          // This is just in case we support type = enumSpec in the future
          encQ.aggregate = makeEnumSpec(encQ.aggregate);
          encQ.bin = makeEnumSpec(encQ.bin);
          encQ.timeUnit = makeEnumSpec(encQ.timeUnit);
        } else {
          switch (encQ.type) {
            case vl.type.Type.QUANTITATIVE:
              if (encQ.aggregate === 'count') {
                // Skip count, so that it can be added back as autoCount or omitted
                return encodings;
              } else {
                // For other Q, it should be either aggregate or binned
                encQ.aggregate = makeEnumSpec(encQ.aggregate);
                encQ.bin = makeEnumSpec(encQ.bin);
                encQ.hasFn = true;
              }
              break;
            case vl.type.Type.TEMPORAL:
              // TODO: only year and periodic timeUnit
              encQ.timeUnit = makeEnumSpec(encQ.timeUnit);
              break;
          }
        }
        return encodings.concat(encQ);
      }, []);

      // TODO: extend config
      return {
        spec: newSpecQ,
        groupBy: 'fieldTransform',
        // fieldOrder should be the same, since we have similar fields
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        // aggregationQuality should be the same with group with similar transform
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {
          autoAddCount: true,
          omitRaw: true
        }
      };
    }

    function disaggregate(query) {
      var newSpecQ = util.duplicate(query.spec);
      newSpecQ.mark = makeEnumSpec(newSpecQ.mark);
      newSpecQ.encodings = newSpecQ.encodings
        .filter(function (encQ) {
          return encQ.aggregate !== 'count';
        })
        .map(function (encQ) {
          // encQ.channel = makeEnumSpec(encQ.channel);
          if (cql.enumSpec.isEnumSpec(encQ.type) || encQ.type === vl.type.Type.QUANTITATIVE) {
            delete encQ.aggregate;
            delete encQ.bin;
          }
          return encQ;
        });

      return {
        spec: newSpecQ,
        groupBy: 'fieldTransform',
        // field order would be actually the same
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {
          autoAddCount: false,
          omitAggregate: true
        }
      };
    }

    function addCategoricalField(query) {
      var newSpecQ = util.duplicate(query.spec);
      newSpecQ.encodings.push({
        channel: cql.enumSpec.SHORT_ENUM_SPEC,
        field: cql.enumSpec.SHORT_ENUM_SPEC,
        type: vl.type.Type.NOMINAL
        // type: {
        //   enum: [vl.type.Type.NOMINAL, vl.type.Type.ORDINAL]
        // }
      });
      return {
        spec: newSpecQ,
        groupBy: 'field',
        // FieldOrder should dominates everything else
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        // aggregationQuality should be the same
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {
          autoAddCount: true
        }
      };
    }

    function addQuantitativeField(query) {
      var newSpecQ = util.duplicate(query.spec);
      newSpecQ.encodings.push({
        channel: cql.enumSpec.SHORT_ENUM_SPEC,
        bin: cql.enumSpec.SHORT_ENUM_SPEC,
        aggregate: cql.enumSpec.SHORT_ENUM_SPEC,
        field: cql.enumSpec.SHORT_ENUM_SPEC,
        type: vl.type.Type.QUANTITATIVE
      });
      return {
        spec: newSpecQ,
        groupBy: 'field',
        // FieldOrder should dominates everything else
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {
          autoAddCount: true
        }
      };
    }

    function addTemporalField(query) {
      var newSpecQ = util.duplicate(query.spec);
      newSpecQ.encodings.push({
        channel: cql.enumSpec.SHORT_ENUM_SPEC,
        hasFn: true,
        timeUnit: cql.enumSpec.SHORT_ENUM_SPEC,
        field: cql.enumSpec.SHORT_ENUM_SPEC,
        type: vl.type.Type.TEMPORAL
      });
      return {
        spec: newSpecQ,
        groupBy: 'field',
        // FieldOrder should dominates everything else
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {
          autoAddCount: true
        }
      };
    }

    function histograms(query) {
      return {
        spec: {
          data: query.spec.data,
          mark: cql.enumSpec.SHORT_ENUM_SPEC,
          transform: query.spec.transform,
          encodings: [
            { channel: cql.enumSpec.SHORT_ENUM_SPEC, field: cql.enumSpec.SHORT_ENUM_SPEC, bin: cql.enumSpec.SHORT_ENUM_SPEC, timeUnit: cql.enumSpec.SHORT_ENUM_SPEC, type: cql.enumSpec.SHORT_ENUM_SPEC },
            { channel: cql.enumSpec.SHORT_ENUM_SPEC, field: '*', aggregate: vl.aggregate.AggregateOp.COUNT, type: vl.type.Type.QUANTITATIVE }
          ]
        },
        groupBy: 'fieldTransform',
        // FieldOrder should dominates everything else
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        // aggregationQuality should be the same
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: { autoAddCount: false }
      };
    }

    return Alternatives;
  });
