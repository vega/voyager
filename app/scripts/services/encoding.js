'use strict';

angular.module('vleApp')
  .factory('Encoding', function ($http, Config, EncodingSchema) {
    var service = {};

    service.encoding = null;

    service.parseShorthand = function(newShorthand) {
      service.encoding = vl.Encoding.parseShorthand(newShorthand, Config.config).toJSON();
    }

    service.updateEncoding = function() {
      EncodingSchema.getEncodingSchema().then(function(schema) {
        service.encoding = EncodingSchema.instanceFromSchema(schema);
      }, function(reason) {
        console.warn(reason);
      });
    };

    // initially set encoding
    service.updateEncoding();

    return service;
  });
