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
      Alerts, Alternatives, Chart, Config, Dataset, Logger, Schema, Pills) {

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
        config: Config.config
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
      hasPlot: false, // HACK
      alternatives: [],
      histograms: null,
      instantiate: instantiate
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
      return vl.util.mergeDeep(instantiate(), spec);
    }

    // takes a partial spec
    Spec.parseSpec = function(newSpec) {
      // TODO: revise this
      Spec.spec = parse(newSpec);
    };

    function isAllChannelAndFieldSpecific(topItem) {
      if (!topItem) {
        return true;
      }
      var enumSpecIndex = topItem.enumSpecIndex;
      return util.keys(enumSpecIndex.encodingIndicesByProperty).length === 0;
    }

    Spec.preview = function(enable, chart, listTitle) {
      if (enable) {
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

    Spec.reset = function() {
      Spec.spec = instantiate();
    };

    /**
     * Takes a full spec, validates it and then rebuilds all members of the chart object.
     */
    Spec.update = function(spec) {
      spec = _.cloneDeep(spec || Spec.spec);

      Spec._removeEmptyFieldDefs(spec);
      deleteNulls(spec);

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
        var query = Spec.cleanQuery = getQuery(spec);
        var output = cql.query(query, Dataset.schema);
        Spec.query = output.query;
        var topItem = output.result.getTopSpecQueryModel();
        Spec.isSpecific = isAllChannelAndFieldSpecific(topItem);
        Spec.hasPlot = Spec.query && Spec.query.spec.encodings.length > 0;
        Spec.alternatives = [];

        if (Spec.isSpecific) {
          Spec.chart = Chart.getChart(topItem);
          Spec.charts = null;

          if (Dataset.schema) {
            if (query.spec.encodings.length > 0) {
              Spec.alternatives = Alternatives.getAlternatives(query, Spec.chart);

            } else {
              Spec.alternatives = [Alternatives.getHistograms(query, Spec.chart)];
            }
          }
        } else {
          Spec.charts = output.result.items.map(Chart.getChart);
          Spec.chart = Chart.getChart(null);
        }

      // }
    };

    function getQuery(spec) {
      var specQuery = {
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
              name: 'f' + channelId
            };
          }

          encodings.push(encQ);
          return encodings;
        }, []),
        config: spec.config
      };

      var hasAnyField = _.some(specQuery.encodings, function(encQ) {
        return cql.enumSpec.isEnumSpec(encQ.field);
      });

      var groupBy = hasAnyField ?
        ['field', 'aggregate', 'bin', 'timeUnit', 'stack'] :
        ['field', 'aggregate', 'bin', 'timeUnit', 'stack', 'channel']; // do not group by mark

      return {
        spec: specQuery,
        groupBy: groupBy,
        chooseBy: 'effectiveness',
        config: {
          omitTableWithOcclusion: false
        }
      };
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


    Pills.listener = {
      set: function(channelId, pill) {
        updateChannelDef(Spec.spec.encoding, pill, channelId);
      },
      remove: function(channelId) {
        if (Pills.isAnyChannel(channelId)) {
          // For ANY channel, completely remove it from the encoding
          delete Spec.spec.encoding[channelId];
        } else {
          // For typically channels, remove all pill detail from the fieldDef, but keep the object
          updateChannelDef(Spec.spec.encoding, {}, channelId);
        }
      },
      add: function(fieldDef) {
        var oldMarkIsEnumSpec = cql.enumSpec.isEnumSpec(Spec.cleanQuery.spec.mark);

        Logger.logInteraction(Logger.actions.ADD_FIELD, fieldDef, {
          from: Spec.chart.shorthand
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

          // The top spec will always have specific mark.
          // We need to restore the mark to ANY if applicable.
          var topSpec = result.getTopSpecQueryModel().toSpec();
          if (oldMarkIsEnumSpec) {
            topSpec.mark = ANY;
          }
          Spec.parseSpec(topSpec);
        } else {
          var encoding = _.clone(Spec.spec.encoding);
          // Just add to any channel because CompassQL do not support partial filling yet.
          var emptyAnyChannel = Pills.getEmptyAnyChannelId();
          updateChannelDef(encoding, _.clone(fieldDef), emptyAnyChannel);

          // Add new any as a placeholder
          var newAnyChannel = Pills.getNextAnyChannelId();
          updateChannelDef(encoding, {}, newAnyChannel);

          Spec.spec.encoding = encoding;
        }

      },
      parse: function(spec) {
        Spec.parseSpec(spec);
      },
      preview: Spec.preview,
      update: function(spec) {
        Spec.update(spec);
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
            var newAnyChannel = Pills.getNextAnyChannelId();
            updateChannelDef(encoding, {}, newAnyChannel);
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
        return !Spec.spec.encoding[channelId].field;
      },
      isEnumeratedField: function(channelId) {
        return cql.enumSpec.isEnumSpec(Spec.spec.encoding[channelId].field);
      },
      toggleFilterInvalid: function () {
        Spec.spec.transform.filterInvalid = Spec.spec.transform.filterInvalid ? undefined : true;
      }
    };

    Spec.reset();
    Dataset.onUpdate.push(Spec.reset);

    return Spec;
  });
