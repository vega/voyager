'use strict';

/**
 * @ngdoc service
 * @name vleApp.Spec
 * @description
 * # Spec
 * Service in the vleApp.
 */
angular.module('vleApp')
  .service('Spec', function(_, vl, tv4, Alerts, Config, Dataset) {
    var Spec = {
      /** @type {Object} verbose spec edited by the UI */
      spec: null,
      /** @type {Object} concise spec generated */
      vlSpec: null,
      /** @type {Encoding} encoding object from the spec */
      encoding: null,
      /** @type {String} generated vl shorthand */
      shorthand: null,
      /** @type {Object} generated vega spec */
      vgSpec: null,
      /** HACK: should become its own service, filter out null values **/
      filterNulls: true
    };

    Spec._removeEmptyFieldDefs = function(spec) {
      spec.enc = _.omit(spec.enc, function(fieldDef) {
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
      Spec.spec = vl.Encoding.parseShorthand(newShorthand, Config.config).toSpec();
    };

    // takes a partial spec
    Spec.parseSpec = function(newSpec) {
      Spec.spec = vl.schema.util.merge(Spec.spec, newSpec);
    };

    Spec.reset = function() {
      Spec.spec = vl.schema.instantiate();

      // we need to set the marktype because it doesn't have a default.
      Spec.spec.marktype = vl.schema.schema.properties.marktype.enum[0];
    };

    // takes a full spec, validates it and then rebuilds everything
    Spec.update = function(spec) {
      if (!spec) {
        if (!spec) spec = Spec.spec;
      }

      var cleanSpec = _.cloneDeep(spec);

      Spec._removeEmptyFieldDefs(cleanSpec);
      deleteNulls(cleanSpec);

      // we may have removed enc
      if (!('enc' in cleanSpec)) {
        cleanSpec.enc = {};
      }

      if (Spec.filterNulls && Dataset.dataschema.length > 0) {
        cleanSpec.filter = [{
          operator: 'notNull',
          operands: _.chain(Dataset.dataschema).filter(function(d){
            return d.name != '*'
          }).pluck('name').value()
        }];
      }

      var schema = vl.schema.schema;
      // now validate the spec
      var result = tv4.validateMultiple(cleanSpec, schema);

      if (result.errors.length > 0) {
        //FIXME: move this dependency to directive/controller layer
        Alerts.add({
          msg: result.errors
        });
      } else {
        Spec.encoding = vl.Encoding.fromSpec(cleanSpec, {}, Config.config);
        Spec.vlSpec = Spec.encoding.toSpec(false);
        Spec.shorthand = Spec.encoding.toShorthand();
        Spec.vgSpec = vl.compile(Spec.encoding, Dataset.stats);

        // console.log('Spec.update() enc:', Spec.vlSpec.enc);
      }
    };

    Spec.reset();

    return Spec;
  });
