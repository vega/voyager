'use strict';

/**
 * @ngdoc service
 * @name polestar.Spec
 * @description
 * # Spec
 * Service in the polestar.
 */
angular.module('polestar')
  .service('Spec', function(_, vl, ZSchema, Alerts, Config) {
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
      spec.encoding = _.omit(spec.encoding, function(fieldDef) {
        return !fieldDef || (fieldDef.name === undefined && fieldDef.value === undefined);
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
          (_.isObject(spec[i]) && vl.keys(spec[i]).length === 0) ||
          spec[i] === []) {
          delete spec[i];
        }
      }
    }

    Spec.parseShorthand = function(newShorthand) {
      var newSpec = vl.Encoding.parseShorthand(newShorthand, Config.config).toSpec();
      Spec.parseSpec(newSpec);
    };

    // takes a partial spec
    Spec.parseSpec = function(newSpec) {
      Spec.spec = vl.schema.util.merge(Spec.instantiate(), newSpec);
    };

    Spec.instantiate = function() {
      var spec = vl.schema.instantiate();

      // we need to set the marktype because it doesn't have a default.
      spec.marktype = vl.schema.schema.properties.marktype.enum[0];
      spec.config = Config.config;
      spec.data = Config.data;
      return spec;
    };

    Spec.reset = function() {
      Spec.spec = Spec.instantiate();
    };

    // takes a full spec, validates it and then rebuilds everything
    Spec.update = function(spec) {
      if (!spec) {
        spec = Spec.spec;
      }

      var cleanSpec = _.cloneDeep(spec);

      Spec._removeEmptyFieldDefs(cleanSpec);
      deleteNulls(cleanSpec);

      // we may have removed enc
      if (!('encoding' in cleanSpec)) {
        cleanSpec.encoding = {};
      }
      var validator = new ZSchema();

      validator.setRemoteReference('http://json-schema.org/draft-04/schema', {});

      var schema = vl.schema.schema;
      // now validate the spec
      var valid = validator.validate(cleanSpec, schema);

      if (!valid) {
        //FIXME: move this dependency to directive/controller layer
        Alerts.add({
          msg: validator.getLastErrors()
        });
      } else {
        vl.extend(cleanSpec.config, Config.large());
        var encoding = vl.Encoding.fromSpec(cleanSpec),
          chart = Spec.chart;

        chart.fieldSet =  Spec.spec.encoding;
        chart.vlSpec = Spec.spec;
        chart.cleanSpec = encoding.toSpec(false);
        chart.shorthand = encoding.toShorthand();
        console.log('chart', chart.vgSpec, chart.vlSpec);
      }
    };

    Spec.reset();

    return Spec;
  });
