'use strict';

/**
 * @ngdoc service
 * @name voyager2.Spec
 * @description
 * # Spec
 * Service in the voyager2.
 */
angular.module('voyager2')
  // TODO: rename to Query once it's complete independent from Polestar
  .service('Spec', function(ANY, _, vg, vl, cql, util, ZSchema, consts,
      Alerts, Alternatives, Chart, Config, Dataset, Logger, Pills, Schema, Wildcards, FilterManager) {

    var keys =  _.keys(Schema.schema.definitions.Encoding.properties).concat([ANY+0]);

    function instantiate() {
      return {
        data: Config.data,
        transform: {
          filterInvalid: undefined
        },
        mark: ANY,
        encoding: keys.reduce(function(e, c) {
          e[c] = {};
          return e;
        }, {}),
        config: Config.config,
        groupBy: 'auto',
        autoAddCount: false
      };
    }

    var Spec = {
      /** @type {Object} verbose spec edited by the UI */
      spec: null,
      /** Spec that we are previewing */
      previewedSpec: null,
      /** Spec that we can instantiate */
      emptySpec: instantiate(),
      /** @type {Query} */
      query: null,
      isSpecific: true,
      charts: null,
      chart: Chart.getChart(null),
      isEmptyPlot: true,
      alternatives: [],
      histograms: null,
      instantiate: instantiate,
      groupByLabel: {
        field: 'Showing views with different fields',
        fieldTransform: 'Showing views with different fields and transforms',
        encoding: 'Showing views with different encodings',
      },
      autoGroupBy: null
    };

    Spec._removeEmptyFieldDefs = function(spec) {
      spec.encoding = _.omit(spec.encoding, function(fieldDef, channel) {
        return !fieldDef || (fieldDef.field === undefined && fieldDef.value === undefined) ||
          (spec.mark && ! vl.channel.supportMark(channel, spec.mark));
      });
    };

    function deleteNulls(obj) {
      for (var prop in obj) {
        if (_.isObject(obj[prop])) {
          deleteNulls(obj[prop]);
        }
        // This is why I hate js
        if (obj[prop] === null ||
          obj[prop] === undefined ||
          (
            // In general, {} should be removed from spec. bin:{} is an exception.
            _.isObject(obj[prop]) &&
            vg.util.keys(obj[prop]).length === 0 &&
            prop !== 'bin'
          ) ||
          obj[prop] === []) {
          delete obj[prop];
        }
      }
    }

    function parse(spec) {
      var oldSpec = util.duplicate(spec);
      var oldFilter = null;

      if (oldSpec) {
        // Store oldFilter, copy oldSpec that exclude transform.filter
        oldFilter = (oldSpec.transform || {}).filter;
        var transform = _.omit(oldSpec.transform || {}, 'filter');
        oldSpec = _.omit(oldSpec, 'transform');
        if (transform) {
          oldSpec.transform = transform;
        }
      }

      var newSpec = vl.util.mergeDeep(instantiate(), oldSpec);

      // This is not Vega-Lite filter object, but rather our FilterModel
      newSpec.transform.filter = FilterManager.reset(oldFilter);

      return newSpec;
    }

    // takes a partial spec
    Spec.parseSpec = function(newSpec) {
      // TODO: revise this
      Spec.spec = parse(newSpec);
    };

    Spec.reset = function(hard) {
      var spec = instantiate();
      spec.transform.filter = FilterManager.reset(null, hard);
      Spec.spec = spec;
    };

    /**
     * Takes a full spec, validates it and then rebuilds all members of the chart object.
     */
    Spec.update = function(spec) {
      spec = _.cloneDeep(spec || Spec.spec);


      Spec._removeEmptyFieldDefs(spec);
      deleteNulls(spec);

      if (spec.transform && spec.transform.filter) {
        delete spec.transform.filter;
      }

      spec.transform = spec.transform || {};

      var filter = FilterManager.getVlFilter();
      if (filter || spec.transform.filter) {
        spec.transform.filter = filter;
      }

      // we may have removed encoding
      if (!('encoding' in spec)) {
        spec.encoding = {};
      }
      if (!('config' in spec)) {
        spec.config = {};
      }
      // var validator = new ZSchema();
      // validator.setRemoteReference('http://json-schema.org/draft-04/schema', {});

      // var schema = Schema.schema;

      // ZSchema.registerFormat('color', function (str) {
      //   // valid colors are in list or hex color
      //   return /^#([0-9a-f]{3}){1,2}$/i.test(str);
      //   // TODO: support color name
      // });
      // ZSchema.registerFormat('font', function () {
      //   // right now no fonts are valid
      //   return false;
      // });

      // // now validate the spec
      // var valid = validator.validate(spec, schema);

      // if (!valid) {
      //   //FIXME: move this dependency to directive/controller layer
      //   Alerts.add({
      //     msg: validator.getLastErrors()
      //   });
      // } else {
        vg.util.extend(spec.config, Config.small());

        if (!Dataset.schema) { return Spec; }

        var query = Spec.cleanQuery = getQuery(spec);
        if (_.isEqual(query, Spec.oldCleanQuery)) {
          return Spec; // no need to update charts
        }
        Spec.oldCleanQuery = _.cloneDeep(query);
        var output = cql.query(query, Dataset.schema);
        Spec.query = output.query;
        var topItem = output.result.getTopSpecQueryModel();
        Spec.isEmptyPlot = !Spec.query || Spec.query.spec.encodings.length === 0;
        Spec.isSpecific = isAllChannelAndFieldSpecific(topItem, Spec.isEmptyPlot);
        Spec.alternatives = [];


        if (Spec.isSpecific || Spec.isEmptyPlot) {
          Spec.chart = Chart.getChart(topItem);
          Spec.charts = null;

          if (Dataset.schema) {
            if (query.spec.encodings.length > 0) {
              Spec.alternatives = Alternatives.getAlternatives(query, Spec.chart, topItem);

            } else {
              Spec.alternatives = Alternatives.getHistograms(query, Spec.chart, topItem);
            }
          }
        } else if (topItem) {
          Spec.charts = output.result.items.map(Chart.getChart);
          Spec.chart = Chart.getChart(null);
        } else {
          Spec.charts = null;
          Spec.chart = null;
        }
      // }
      return Spec;
    };

    function isAllChannelAndFieldSpecific(topItem, isEmptyPlot) {
      if (!topItem) {
        return isEmptyPlot; // If it's specific no way we get empty result!
      }
      var enumSpecIndex = topItem.enumSpecIndex;
      return util.keys(enumSpecIndex.encodingIndicesByProperty).length === 0;
    }

    Spec.preview = function(enable, chart, listTitle) {
      if (enable) {
        if (!chart) return;
        var spec = chart.vlSpec;
        Spec.previewedSpec = parse(spec);

        Logger.logInteraction(Logger.actions.SPEC_PREVIEW_ENABLED, chart.shorthand, {
          list: listTitle
        });
      } else {
        if (Spec.previewedSpec !== null) {
          // If it's already null, do nothing.  We have multiple even triggering preview(null)
          // as sometimes when lagged, the unpreview event is not triggered.
          Spec.previewedSpec = null;
          Logger.logInteraction(Logger.actions.SPEC_PREVIEW_DISABLED, chart.shorthand, {
            list: listTitle
          });
        }
      }
    };
    Spec.previewQuery = function(enable, query, listTitle) {
      if (enable) {
        if (!query) return;
        Spec.previewedSpec = parseQuery(query);

        Logger.logInteraction(Logger.actions.SPEC_PREVIEW_ENABLED, cql.query.shorthand.spec(query.spec), {
          list: listTitle
        });
      } else {
        if (Spec.previewedSpec !== null) {
          // If it's already null, do nothing.  We have multiple even triggering preview(null)
          // as sometimes when lagged, the unpreview event is not triggered.
          Spec.previewedSpec = null;
          Logger.logInteraction(Logger.actions.SPEC_PREVIEW_DISABLED, cql.query.shorthand.spec(query.spec), {
          list: listTitle
        });
        }
      }
    };

    function getSpecQuery(spec, convertFilter /*HACK*/) {
      if (convertFilter) {
        spec = util.duplicate(spec);


        // HACK convert filter manager to proper filter spec
        if (spec.transform && spec.transform.filter) {
          delete spec.transform.filter;
        }

        var filter = FilterManager.getVlFilter();
        if (filter) {
          spec.transform = spec.transform || {};
          spec.transform.filter = filter;
        }
      }

      return {
        data: Config.data,
        mark: spec.mark === ANY ? '?' : spec.mark,

        // TODO: support transform enumeration
        transform: spec.transform,
        encodings: vg.util.keys(spec.encoding).reduce(function(encodings, channelId) {
          var encQ = vg.util.extend(
            // Add channel
            { channel: Pills.isAnyChannel(channelId) ? '?' : channelId },
            // Field Def
            spec.encoding[channelId],
            // Remove Title
            {title: undefined}
          );

          if (cql.enumSpec.isEnumSpec(encQ.field)) {
            // replace the name so we should it's the field from this channelId
            encQ.field = {
              name: 'f' + channelId,
              enum: encQ.field.enum
            };
          }

          encodings.push(encQ);
          return encodings;
        }, []),
        config: spec.config
      };
    }

    function parseQuery(query) {
      var specQuery = util.duplicate(query.spec);
      // Mark -> ANY
      var spec = instantiate();

      if (cql.enumSpec.isEnumSpec(specQuery.mark)) {
        spec.mark = ANY;
      } else {
        spec.mark = specQuery.mark;
      }

      spec.transform = _.omit(specQuery.transform || {}, 'filter');
      // This is not Vega-Lite filter object, but rather our FilterModel
      spec.transform.filter = FilterManager.reset(specQuery.transform.filter);

      var anyCount = 0;

      var encoding = specQuery.encodings.reduce(function(e, encQ) {
        // Channel -> ANY0, ANY1
        var channel = cql.enumSpec.isEnumSpec(encQ.channel) ? ANY + (anyCount++) : encQ.channel;
        e[channel] = encQ;
        return e;
      }, {});
      spec.encoding = vl.util.mergeDeep(spec.encoding, encoding);
      spec.config = specQuery.config;

      spec.groupBy = 'auto'; // query.groupBy;
      spec.autoAddCount = (query.config || {}).autoAddCount;
      return spec;
    }

    function getQuery(spec, convertFilter /*HACK */) {
      var specQuery = getSpecQuery(spec, convertFilter);

      var hasAnyField = false, hasAnyFn = false;

      for (var i = 0; i < specQuery.encodings.length; i++) {
        var encQ = specQuery.encodings[i];
        if (encQ.autoCount === false) continue;

        if (cql.enumSpec.isEnumSpec(encQ.field)) {
          hasAnyField = true;
        }

        if (cql.enumSpec.isEnumSpec(encQ.aggregate) ||
            cql.enumSpec.isEnumSpec(encQ.bin) ||
            cql.enumSpec.isEnumSpec(encQ.timeUnit)) {
          hasAnyFn = true;
        }
      }

      /* jshint ignore:start */
      var groupBy = spec.groupBy;

      if (spec.groupBy === 'auto') {
        groupBy = Spec.autoGroupBy = hasAnyField ?
          (hasAnyFn ? 'fieldTransform' : 'field') :
          'encoding';
      }

      return {
        spec: specQuery,
        groupBy: groupBy,
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {
          omitTableWithOcclusion: false,
          autoAddCount: spec.autoAddCount
        }
      };
      /* jshint ignore:end */
    }

    function instantiatePill(channel) { // jshint ignore:line
      return {};
    }

    /** copy value from the pill to the fieldDef */
    function updateChannelDef(encoding, pill, channel){
      var type = pill.type;
      var supportedRole = Pills.isAnyChannel(channel) ?
        {measure: true, dimension : true} :
        vl.channel.getSupportedRole(channel);
      var dimensionOnly = supportedRole.dimension && !supportedRole.measure;

      // auto cast binning / time binning for dimension only encoding type.
      if (pill.field && dimensionOnly) {
        if (pill.aggregate==='count') {
          pill = {};
        } else if (type === vl.type.QUANTITATIVE && !pill.bin) {
          pill.aggregate = undefined;
          pill.bin = {maxbins: vl.bin.MAXBINS_DEFAULT};
        } else if(type === vl.type.TEMPORAL && !pill.timeUnit) {
          pill.timeUnit = consts.defaultTimeFn;
        }
      } else if (!pill.field) {
        // no field, it's actually the empty shelf that
        // got processed in the opposite direction
        pill = {};
      }

      // filter unsupported properties
      var fieldDef = instantiatePill(channel),
        shelfProps = Schema.getChannelSchema(channel).properties;

      for (var prop in shelfProps) {
        if (pill[prop]) {
          if (prop==='value' && pill.field) {
            // only copy value if field is not defined
            // (which should never be the case)
            delete fieldDef[prop];
          } else {
            //FXIME In some case this should be merge / recursive merge instead ?
            fieldDef[prop] = pill[prop];
          }
        }
      }
      encoding[channel] = fieldDef;
    }

    function addNewAnyChannel(encoding) {
      var newAnyChannel = Pills.getNextAnyChannelId();
      if (newAnyChannel !== null) {
        updateChannelDef(encoding, {}, newAnyChannel);
      }
    }


    Pills.listener = {
      set: function(channelId, pill) {
        updateChannelDef(Spec.spec.encoding, pill, channelId);
      },
      remove: function(channelId) {
        if (Pills.isAnyChannel(channelId)) {
          // For ANY channel, completely remove it from the encoding
          delete Spec.spec.encoding[channelId];
          // Check if we remove the last available any channel shelf
          var emptyAnyChannel = Pills.getEmptyAnyChannelId();
          if (!emptyAnyChannel) {
            // if so, add one back!
            addNewAnyChannel(Spec.spec.encoding);
          }
        } else {
          // For typically channels, remove all pill detail from the fieldDef, but keep the object
          updateChannelDef(Spec.spec.encoding, {}, channelId);
        }
      },
      add: function(fieldDef) {
        var oldMarkIsEnumSpec = cql.enumSpec.isEnumSpec(Spec.cleanQuery.spec.mark);

        Logger.logInteraction(Logger.actions.ADD_FIELD, fieldDef, {
          from: cql.query.shorthand.spec(Spec.query.spec)
        });

        if (Spec.isSpecific && !cql.enumSpec.isEnumSpec(fieldDef.field)) {
          // Call CompassQL to run query and load the top-ranked result
          var specQuery = Spec.cleanQuery.spec;
          var encQ = _.extend(
            {},
            fieldDef,
            {
              channel: cql.enumSpec.SHORT_ENUM_SPEC
            },
            fieldDef.aggregate === 'count' ? {} : {
              aggregate: cql.enumSpec.SHORT_ENUM_SPEC,
              bin: cql.enumSpec.SHORT_ENUM_SPEC,
              timeUnit: cql.enumSpec.SHORT_ENUM_SPEC
            }
          );
          specQuery.encodings.push(encQ);

          var query = {
            spec: specQuery,
            groupBy: ['field', 'aggregate', 'bin', 'timeUnit', 'stack'],
            orderBy: 'aggregationQuality',
            chooseBy: 'effectiveness',
            config: {omitTableWithOcclusion: false}
          };

          var output = cql.query(query, Dataset.schema);
          var result = output.result;

          var topItem = result.getTopSpecQueryModel();

          if (!topItem) {
            // No Top Item
            Alerts.add('Cannot automatically adding this field anymore');
            return;
          }

          // The top spec will always have specific mark.
          // We need to restore the mark to ANY if applicable.
          var topSpec = topItem.toSpec();
          if (oldMarkIsEnumSpec) {
            topSpec.mark = ANY;
          }
          Spec.parseSpec(topSpec);
        } else {
          var encoding = _.clone(Spec.spec.encoding);
          // Just add to any channel because CompassQL do not support partial filling yet.
          var emptyAnyChannel = Pills.getEmptyAnyChannelId();

          if (!emptyAnyChannel) {
            Alerts.add('You cannot add too many fields to the wildcard shelves!');
            return;
          }

          updateChannelDef(encoding, _.clone(fieldDef), emptyAnyChannel);

          // Add new any as a placeholder
          addNewAnyChannel(encoding);

          Spec.spec.encoding = encoding;
        }

      },
      select: function(spec) {
        var specQuery = getSpecQuery(spec);
        specQuery.mark = '?';

        var query = {
          spec: specQuery,
          chooseBy: 'effectiveness'
        };
        var output = cql.query(query, Dataset.schema);
        var result = output.result;

        if (result.getTopSpecQueryModel().getMark() === spec.mark) {
          // make a copy and replace mark with '?'
          spec = util.duplicate(spec);
          spec.mark = ANY;
        }
        Spec.parseSpec(spec);
      },
      selectQuery: function(query) {
        Spec.spec = parseQuery(query);
      },
      parse: function(spec) {
        Spec.parseSpec(spec);
      },
      preview: Spec.preview,
      previewQuery: Spec.previewQuery,
      update: function(spec) {
        return Spec.update(spec);
      },
      reset: function() {
        Spec.reset();
      },
      dragDrop: function(cidDragTo, cidDragFrom) {
        // Make a copy and update the clone of the encoding to prevent glitches
        var encoding = _.clone(Spec.spec.encoding);
        // console.log('dragDrop', encoding, Pills, 'from:', cidDragFrom, Pills.get(cidDragFrom));

        // If pill is dragged from another shelf, not the schemalist
        if (cidDragFrom) {
          // console.log('pillDragFrom', Pills.get(cidDragFrom));
          if (Pills.isAnyChannel(cidDragFrom) && !Pills.isAnyChannel(cidDragTo)) {
            // For Dragging a pill ANY channel to non-ANY channel,
            // we can  completely remove it from the encoding
            delete encoding[cidDragFrom];
          } else {
            // For typically channels, replace the pill or
            // remove all pill detail from the fieldDef but keep the object
            updateChannelDef(encoding, Pills.get(cidDragFrom) || {}, cidDragFrom);
          }
        }

        var pillDragToWasEmpty = !(encoding[cidDragTo] || {}).field;
        updateChannelDef(encoding, Pills.get(cidDragTo) || {}, cidDragTo);
        // console.log('Pills.dragDrop',
          // 'from:', cidDragFrom, Pills.get(cidDragFrom), encoding[cidDragFrom],
          // 'to:', cidDragTo, Pills.get(cidDragTo), encoding[cidDragTo]);

        // If a pill is dragged from non-ANY channel to an empty ANY channel
        if (Pills.isAnyChannel(cidDragTo) && pillDragToWasEmpty) {
          if (!cidDragFrom || !Pills.isAnyChannel(cidDragFrom)) {
            // If drag new field from schema or from normal shelf, add new any
            addNewAnyChannel(encoding);
          }
        }

        // Finally, update the encoding only once to prevent glitches
        Spec.spec.encoding = encoding;
      },
      rescale: function (channelId, scaleType) {
        var fieldDef = Spec.spec.encoding[channelId];
        if (fieldDef.scale) {
          fieldDef.scale.type = scaleType;
        } else {
          fieldDef.scale = {type: scaleType};
        }
      },
      sort: function(channelId, sort) {
        Spec.spec.encoding[channelId].sort = sort;
      },
      transpose: function() {
        Chart.transpose(Spec.spec);
      },
      isEnumeratedChannel: function(channelId) {
        return Spec.spec.encoding[channelId] && !Spec.spec.encoding[channelId].field;
      },
      isEnumeratedField: function(channelId) {
        return Spec.spec.encoding[channelId] && cql.enumSpec.isEnumSpec(Spec.spec.encoding[channelId].field);
      },
      toggleFilterInvalid: function () {
        Spec.spec.transform.filterInvalid = Spec.spec.transform.filterInvalid ? undefined : true;
      },
      addWildcard: Wildcards.addItem,
      addWildcardField: Wildcards.addField,
      removeWildcard: Wildcards.removeItem,
      removeWildcardField: Wildcards.removeField,
    };

    Spec.reset();
    Dataset.onUpdate.push(function() {
      Spec.reset(true);
    });

    return Spec;
  });
