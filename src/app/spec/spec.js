'use strict';

/**
 * @ngdoc service
 * @name vleApp.Spec
 * @description
 * # Spec
 * Service in the vleApp.
 */
angular.module('vleApp')
  .service('Spec', function (_, vl, tv4, Alerts, Config, Dataset) {
    var Spec = {
      /** @type {Object} verbose spec edited by the UI */
      spec: vl.schema.instantiate(),
      /** @type {Object} concise spec generated */
      vlSpec: null,
      /** @type {String} jsonify-ed vlSpec */
      vlSpecJson: '',
      /** @type {Encoding} encoding object from the spec */
      encoding:null,
      /** @type {String} generated vl shorthand */
      shorthand:null,
      /** @type {Object} generated vega spec */
      vgSpec:null,
      /** @type {String} jsonify-ed vgSpec */
      vgSpecJson:null
    };

    Spec._removeEmptyFieldDefs = function(spec) {
      spec.enc = _.omit(spec.enc, function(fieldDef) {
        return !fieldDef || fieldDef.name === undefined;
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
      Spec.spec = vl.Encoding.parseShorthand(newShorthand, Config.config).toSpec();
      Spec.updateSpec(Spec.spec);
    };

    Spec.resetSpec = function() {
      Spec.spec = vl.schema.instantiate();
    };

    // TODO: should we call this `specChanged` ?
    Spec.updateSpec = function(newSpec) {
      var cleanSpec = _.cloneDeep(newSpec);

      Spec._removeEmptyFieldDefs(cleanSpec);
      deleteNulls(cleanSpec);

      // we may have removed enc
      if (!('enc' in cleanSpec)) {
        cleanSpec.enc = {};
      }

      // TODO: remove defaults
      var schema = vl.schema.schema;
      // now validate the spec
      var result = tv4.validateMultiple(cleanSpec, schema);

      if (result.errors.length > 0) {
        //FIXME: move this dependency to directive/controller layer
        Alerts.add({
          msg: result.errors
        });
      } else {
        Spec.vlSpec = cleanSpec;
        Spec.vlSpecJson = JSON.stringify(Spec.vlSpec, null, '  ', 80);
        Spec.encoding = vl.Encoding.fromSpec(cleanSpec, Config.config);
        Spec.shorthand = Spec.encoding.toShorthand();
        Spec.vgSpec = vl.compile(Spec.encoding, Dataset.stats);
        Spec.vgSpecJson = JSON.stringify(Spec.vgSpec, null, '  ', 80);
      }
    };

    Spec.updateSpec(Spec.spec);

    return Spec;
  });
