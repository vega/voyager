'use strict';

angular.module('voyager2')
  .service('Alternatives', function (ANY, vl, cql, util, Dataset, _) {
    var Alternatives = {
      query: query,
      alternativeEncodings: alternativeEncodings,
      summarize: summarize,
      disaggregate: disaggregate,
      addCategoricalField: addCategoricalField,
      addQuantitativeField: addQuantitativeField,
      histograms: histograms
    };

    function query(suggestionType, query, mainSpec) {
      var alternativeQuery = Alternatives[suggestionType](query);
      var output = cql.query(alternativeQuery, Dataset.schema);

      // Don't include the specified visualization in the recommendation list
      var filteredItems = output.result.items.filter(function(item) {
        var topItem = item.getTopSpecQueryModel();
        return !mainSpec || !_.isEqual(mainSpec, topItem.toSpec());
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
        chooseBy: 'effectiveness',
        orderBy: 'aggregationQuality',
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
        groupBy: GROUP_BY_FIELD,
        orderBy: 'aggregationQuality',
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
