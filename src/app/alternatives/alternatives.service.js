'use strict';

angular.module('voyager2')
  .service('Alternatives', function (ANY, vl, cql, util, Dataset, _) {
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

    function getHistograms(query, chart) {
      return executeQuery('histograms', query, chart);
    }

    function getAlternatives(query, chart) {
      var isAggregate = cql.query.spec.isAggregate(query.spec);

      var suggestionTypes = [];

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

      suggestionTypes.push({
        type: 'summarize',
        title: 'Summaries'
      });

      if (hasOpenPosition || !hasStyleChannel) {
        suggestionTypes.push({
          type: 'addQuantitativeField',
          title: 'Add Quantitative Field'
        });
      }

      if (hasOpenPosition || !hasStyleChannel || hasOpenFacet) {
        suggestionTypes.push({
          type: 'addCategoricalField',
          title: 'Add Categorical Field'
        });
      }

      if (!hasT && hasOpenPosition) {
        suggestionTypes.push({
          type: 'addTemporalField',
          title: 'Add Temporal Field'
        });
      }

      suggestionTypes.push({
        type: 'alternativeEncodings',
        title: 'Re-Encode'
      });

      if (isAggregate) {
        suggestionTypes.push({
          type: 'disaggregate',
          title: 'Disaggregate'
        });
      }


      return suggestionTypes.map(function(suggestion) {
        suggestion.output = executeQuery(suggestion.type, query, chart);
        return suggestion;
      });
    }

    function executeQuery(suggestionType, query, mainChart) {
      var alternativeQuery = Alternatives[suggestionType](query);
      var output = cql.query(alternativeQuery, Dataset.schema);

      // Don't include the specified visualization in the recommendation list
      var filteredItems = output.result.items.filter(function(item) {
        var topItem = item.getTopSpecQueryModel();
        return !mainChart || !mainChart.shorthand ||
          topItem.toShorthand() !== mainChart.shorthand;
      });
      // TODO: filter original from result
      return filteredItems.length ? util.extend({}, output, {items: filteredItems}) : null;
    }

    function makeEnumSpec(val) {
      return cql.enumSpec.isEnumSpec(val) ? val : cql.enumSpec.SHORT_ENUM_SPEC;
    }

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

    var GROUP_BY_FIELD = [
      {
        property: cql.property.Property.FIELD,
        replace: {'*': ''}
      }
    ];

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
        groupBy: GROUP_BY_SIMILAR_ENCODINGS,
        orderBy: 'effectiveness',
        chooseBy: 'effectiveness'
      };
    }

    function summarize(query) {
      var newSpecQ = util.duplicate(query.spec);

      // Make mark an enum spec
      newSpecQ.mark = makeEnumSpec(newSpecQ.mark);

      // For convert encoding for summary
      newSpecQ.encodings = newSpecQ.encodings.reduce(function (encodings, encQ) {
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
        groupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM,
        orderBy: 'aggregationQuality',
        chooseBy: 'effectiveness',
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
          if (cql.enumSpec.isEnumSpec(encQ.type) || encQ.type === vl.type.Type.QUANTITATIVE) {
            delete encQ.aggregate;
            delete encQ.bin;
          }
          return encQ;
        });

      return {
        spec: newSpecQ,
        groupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM,
        orderBy: 'aggregationQuality',
        chooseBy: 'effectiveness',
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
        type: {
          values: [vl.type.Type.NOMINAL, vl.type.Type.ORDINAL]
        }
      });
      return {
        spec: newSpecQ,
        groupBy: GROUP_BY_FIELD,
        orderBy: 'aggregationQuality',
        chooseBy: 'effectiveness',
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
        nest: [{
          groupBy: GROUP_BY_FIELD
        },{
          groupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM,
          orderGroupBy: 'aggregationQuality'
        }],
        chooseBy: 'effectiveness',
        config: {
          autoAddCount: true
        }
      };
    }

    function addTemporalField(query) {
      var newSpecQ = util.duplicate(query.spec);
      newSpecQ.encodings.push({
        channel: cql.enumSpec.SHORT_ENUM_SPEC,
        timeUnit: cql.enumSpec.SHORT_ENUM_SPEC,
        field: cql.enumSpec.SHORT_ENUM_SPEC,
        type: vl.type.Type.TEMPORAL
      });
      return {
        spec: newSpecQ,
        nest: [{
          groupBy: GROUP_BY_FIELD
        },{
          groupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM,
          orderGroupBy: 'aggregationQuality'
        }],
        chooseBy: 'effectiveness',
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
          encodings: [
            { channel: cql.enumSpec.SHORT_ENUM_SPEC, field: cql.enumSpec.SHORT_ENUM_SPEC, bin: cql.enumSpec.SHORT_ENUM_SPEC, timeUnit: cql.enumSpec.SHORT_ENUM_SPEC, type: cql.enumSpec.SHORT_ENUM_SPEC },
            { channel: cql.enumSpec.SHORT_ENUM_SPEC, field: '*', aggregate: vl.aggregate.AggregateOp.COUNT, type: vl.type.Type.QUANTITATIVE }
          ]
        },
        groupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM,
        // FIXME: missing orderBy field order
        chooseBy: 'effectiveness',
        config: { autoAddCount: false }
      };
    }

    return Alternatives;
  });
