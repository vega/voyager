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
  .service('Spec', function(ANY, _, vg, vl, cql, ZSchema, Alerts, Config, Dataset, Schema, Pills, $window, consts) {
    var Spec = {
      /** @type {Object} verbose spec edited by the UI */
      spec: null,
      /** @type {Query} */
      query: null
    };

    Spec._removeEmptyFieldDefs = function(spec) {
      spec.encoding = _.omit(spec.encoding, function(fieldDef, channel) {
        return !fieldDef || (fieldDef.field === undefined && fieldDef.value === undefined) ||
          (spec.mark && ! vl.channel.supportMark(channel, spec.mark));
      });
    };

    function deleteNulls(spec) {
      for (var i in spec) {
        if (_.isObject(spec[i])) {
          deleteNulls(spec[i]);
        }
        // This is why I hate js
        if (spec[i] === null ||
          spec[i] === undefined ||
          (_.isObject(spec[i]) && vg.util.keys(spec[i]).length === 0) ||
          spec[i] === []) {
          delete spec[i];
        }
      }
    }

    Spec.parseShorthand = function(newShorthand) {
      var newSpec = vl.shorthand.parseShorthand(newShorthand, null, Config.config);
      Spec.parseSpec(newSpec);
    };

    // takes a partial spec
    Spec.parseSpec = function(newSpec) {
      // TODO: revise this
      Spec.spec = vl.util.mergeDeep(Spec.instantiate(), newSpec);
    };

    var keys =  _.keys(Schema.schema.definitions.Encoding.properties).concat([ANY+0]);

    Spec.instantiate = function() {
      return {
        data: Config.data,
        mark: ANY,
        encoding: keys.reduce(function(e, c) {
          e[c] = {};
          return e;
        }, {}),
        config: Config.config
      };
    };

    Spec.reset = function() {
      Spec.spec = Spec.instantiate();
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
        Spec.result = output.result;
      // }
    };

    function getQuery(spec) {
      var specQuery = {
        data: Config.data,
        mark: spec.mark === ANY ? '?' : spec.mark,
        // TODO: transform
        encodings: vg.util.keys(spec.encoding).reduce(function(encodings, channel) {
          encodings.push(vg.util.extend(
            // Add channel
            { channel: Pills.isAnyChannel(channel) ? '?' : channel },
            // Field Def
            spec.encoding[channel],
            // Remove Title
            {title: undefined}
          ));
          return encodings;
        }, []),
        config: spec.config
      };

      return {
        spec: specQuery,
        groupBy: ['field', 'aggregate', 'bin', 'timeUnit', 'channel'], // do not group by mark
        chooseBy: 'effectiveness'
        // TODO: determine groupBy rule
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
          $window.alert('COUNT not supported here!');
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
      }
    };

    Spec.reset();
    Dataset.onUpdate.push(Spec.reset);

    return Spec;
  });
