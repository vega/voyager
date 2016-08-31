'use strict';

/**
 * @ngdoc service
 * @name polestar.Spec
 * @description
 * # Spec
 * Service in the polestar.
 */
angular.module('polestar')
  .service('Spec', function(_, vg, vl, cql, ZSchema, Alerts, Config, Dataset, Schema, Pills, Chart, consts, util, FilterManager, ANY, Logger) {

    var keys =  _.keys(Schema.schema.definitions.Encoding.properties);

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
      chart: Chart.getChart(null),
      isSpecific: true // Polestar always have specific spec (except for mark)
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

    Spec.reset = function() {
      var spec = instantiate();
      spec.transform.filter = FilterManager.reset();
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

      var filter = FilterManager.getVlFilter();
      if (filter) {
        spec.transform = spec.transform || {};
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

        var query = getQuery(spec);
        if (_.isEqual(query, Spec.cleanQuery)) {
          return Spec; // no need to update charts
        }
        Spec.cleanQuery = query;
        var output = cql.query(query, Dataset.schema);
        Spec.query = output.query;
        var topItem = output.result.getTopSpecQueryModel();
        Spec.chart = Chart.getChart(topItem);
    // }
      return Spec;
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

    function getQuery(spec, convertFilter /*HACK */) {
      var specQuery = getSpecQuery(spec, convertFilter);

      var hasAnyField = _.some(specQuery.encodings, function(encQ) {
        return cql.enumSpec.isEnumSpec(encQ.field);
      });

      var groupBy = hasAnyField ?
        ['field', 'aggregate', 'bin', 'timeUnit', 'stack'] :
        ['field', 'aggregate', 'bin', 'timeUnit', 'stack', 'channel']; // do not group by mark

      return {
        spec: specQuery,
        groupBy: groupBy,
        orderBy: ['aggregationQuality', 'effectiveness'], // FIXME add field order
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
      var type = pill.type,
        supportedRole = vl.channel.getSupportedRole(channel),
        dimensionOnly = supportedRole.dimension && !supportedRole.measure;

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
        updateChannelDef(Spec.spec.encoding, {}, channelId); // remove all pill detail from the fieldDef
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
          if (newAnyChannel !== null) {
            updateChannelDef(encoding, {}, newAnyChannel);
          }

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
      parse: function(spec) {
        Spec.parseSpec(spec);
      },
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
          updateChannelDef(encoding, Pills.get(cidDragFrom) || {}, cidDragFrom);
        }
        updateChannelDef(encoding, Pills.get(cidDragTo) || {}, cidDragTo);

        // console.log('Pills.dragDrop',
        //   'from:', cidDragFrom, Pills.get(cidDragFrom), encoding[cidDragFrom],
        //   'to:', cidDragTo, Pills.get(cidDragTo), encoding[cidDragTo]);

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
      toggleFilterInvalid: function () {
        Spec.spec.transform.filterInvalid = Spec.spec.transform.filterInvalid ? undefined : true;
      }
    };

    Spec.reset();
    Dataset.onUpdate.push(Spec.reset);

    return Spec;
  });
