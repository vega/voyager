'use strict';

/**
 * @ngdoc service
 * @name polestar.Spec
 * @description
 * # Spec
 * Service in the polestar.
 */
angular.module('polestar')
  .service('Spec', function(_, vg, vl, cql, ZSchema, Alerts, Config, Dataset, Schema, Pills, Chart, consts) {
    var Spec = {
      /** @type {Object} verbose spec edited by the UI */
      spec: null,
      chart:{
        /** @type {Object} concise spec generated */
        vlSpec: null,
        /** @type {Encoding} encoding object from the spec */
        encoding: null,
        /** @type {String} generated vl shorthand */
        shorthand: null,
        /** @type {Object} generated vega spec */
        vgSpec: null
      }
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

    Spec.reset = function(loadSpec) {
      var spec = {
        data: Config.data,
        mark: 'point',
        encoding: _.keys(Schema.schema.definitions.Encoding.properties).reduce(function(e, c) {
          e[c] = {};
          return e;
        }, {}),
        config: Config.config
      };

      if (loadSpec) {
        spec = vl.util.mergeDeep(spec, loadSpec);
      }

      Spec.spec = spec;
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
      var validator = new ZSchema();

      validator.setRemoteReference('http://json-schema.org/draft-04/schema', {});

      var schema = Schema.schema;

      ZSchema.registerFormat('color', function (str) {
        // valid colors are in list or hex color
        return /^#([0-9a-f]{3}){1,2}$/i.test(str);
        // TODO: support color name
      });
      ZSchema.registerFormat('font', function () {
        // right now no fonts are valid
        return false;
      });

      // now validate the spec
      var valid = validator.validate(spec, schema);

      if (!valid) {
        //FIXME: move this dependency to directive/controller layer
        Alerts.add({
          msg: validator.getLastErrors()
        });
      } else {
        vg.util.extend(spec.config, Config.large());
        var chart = Spec.chart;

        chart.fieldSet =  Spec.spec.encoding;
        chart.vlSpec = spec;
        chart.cleanSpec = spec; // TODO: eliminate
        chart.shorthand = cql.query.shorthand.vlSpec(spec);
      }
    };

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
      }
    };

    Spec.reset();
    Dataset.onUpdate.push(Spec.reset);

    return Spec;
  });
