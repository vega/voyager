'use strict';

/**
 * @ngdoc service
 * @name polestar.Spec
 * @description
 * # Spec
 * Service in the polestar.
 */
angular.module('polestar')
  .service('Spec', function(_, vg, vl, ZSchema, Alerts, Config, Dataset, Schema) {
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

    Spec.parseShorthand = function(newShorthand) {
      var newSpec = vl.shorthand.parseShorthand(newShorthand, null, Config.config);
      Spec.parseSpec(newSpec);
    };

    // takes a partial spec
    Spec.parseSpec = function(newSpec) {
      // TODO: revise this
      Spec.spec = vl.util.mergeDeep(Spec.instantiate(), newSpec);
    };

    Spec.instantiate = function() {
      return {
        data: Config.data,
        mark: 'point',
        encoding: _.keys(Schema.schema.definitions.Encoding.properties).reduce(function(e, c) {
          e[c] = {};
          return e;
        }, {}),
        config: Config.config
      };
    };

    Spec.reset = function() {
      Spec.spec = Spec.instantiate();
    };

    // takes a full spec, validates it and then rebuilds everything
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
        chart.shorthand = vl.shorthand.shorten(spec);
      }
    };

    Spec.reset();
    Dataset.onUpdate.push(Spec.reset);

    return Spec;
  });
