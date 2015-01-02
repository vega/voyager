'use strict';

angular.module('vleApp')
  .service('Vegalite', function (Encoding, Dataset, Config) {
    var service = {};

    var removeEmptyFieldDefs = function(enc) {
      enc.enc = _.omit(enc.enc, function(fieldDef) {
        return fieldDef.name === null;
      });
    };

    var deleteNulls = function(enc) {
      for (var i in enc) {
        if (_.isObject(enc[i])) {
          deleteNulls(enc[i]);
        }
        // This is why I hate js
        if (enc[i] === null || (_.isObject(enc[i]) && Object.keys(enc[i]).length === 0) || enc[i] === []) {
          delete enc[i];
        }
      }
    };

    service.encoding = null;
    service.vlSpec = null;
    service.vegaSpec = null;

    service.update = function(newEncoding) {
      var cleanEncoding = _.cloneDeep(newEncoding);
      removeEmptyFieldDefs(cleanEncoding)
      deleteNulls(cleanEncoding);

      // we may have removed enc
      if (!('enc' in cleanEncoding)) {
        cleanEncoding.enc = {}
      }

      service.encoding = cleanEncoding;
      service.vlSpec = vl.Encoding.fromEncoding(cleanEncoding, Config.config);
      service.vegaSpec = vl.toVegaSpec(service.vlSpec, Dataset.stats);
    };

    return service;
  });
