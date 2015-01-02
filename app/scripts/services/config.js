'use strict';

angular.module('vleApp')
  .factory('Config', function ($q, Encoding) {
    var service = $q.defer();

    Encoding.getEncodingSchema().then(function(schema) {
      var cfgSchema = schema.properties.cfg;
      var cfg = Encoding.instanceFromSchema(cfgSchema);
      service.resolve({
        schema: cfgSchema,
        cfg: cfg
      });
    }, function(reason) {
      console.warn(reason);
    });

    return service.promise;
  });
