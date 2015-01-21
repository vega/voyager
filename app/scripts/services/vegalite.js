'use strict';

// watch for changes to vgSpec
angular.module('vleApp')
  .service('Vegalite', function ($q, vl, Dataset, Config, VegaliteSpecSchema) {
    var service = {};

    var removeEmptyFieldDefs = function(spec) {
      spec.enc = _.omit(spec.enc, function(fieldDef) {
        return !fieldDef || fieldDef.name === null;
      });
    };

    var deleteNulls = function(spec) {
      for (var i in spec) {
        if (_.isObject(spec[i])) {
          deleteNulls(spec[i]);
        }
        // This is why I hate js
        if (spec[i] === null ||
          spec[i] === undefined ||
          (_.isObject(spec[i]) && Object.keys(spec[i]).length === 0) ||
          spec[i] === []) {
          delete spec[i];
        }
      }
    };

    service.vlSpec = null;
    service.encoding = null;
    service.shorthand = null;
    service.vgSpec = null;

    service.updateVegaliteSpec = function(newSpec) {
      var cleanSpec = _.cloneDeep(newSpec);

      removeEmptyFieldDefs(cleanSpec)
      deleteNulls(cleanSpec);

      // we may have removed enc
      if (!('enc' in cleanSpec)) {
        cleanSpec.enc = {}
      }

      // TODO: remove defaults

      var response = $q.defer();
      var vegaSpecDeferred = $q.defer();

      VegaliteSpecSchema.getSchema().then(function(schema) {
        // now validate the spec
        var result = tv4.validateMultiple(cleanSpec, schema);

        if (result.errors.length > 0) {
          response.reject(result.errors);
        } else {
          service.vlSpec = cleanSpec;
          service.vlSpecJson = JSON.stringify(service.vlSpec, null, "  ", 80);
          service.encoding = vl.Encoding.fromSpec(cleanSpec, Config.config);
          service.shorthand = service.encoding.toShorthand();
          service.vgSpec = vl.compile(service.encoding, Dataset.stats);
          service.vgSpecJson = JSON.stringify(service.vgSpec, null, "  ", 80);
        }
      });

      return response.promise;
    };

    return service;
  });
