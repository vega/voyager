'use strict';

angular.module('vleApp')
  .factory('VegaliteSpec', function ($http, Config, VegaliteSpecSchema) {
    var service = {};

    service.spec = null;

    service.parseShorthand = function(newShorthand) {
      service.spec = vl.Encoding.parseShorthand(newShorthand, Config.config).toSpec();
    }

    service.updateSpec = function() {
      VegaliteSpecSchema.getSchema().then(function(schema) {
        service.spec = VegaliteSpecSchema.instanceFromSchema(schema);
      }, function(reason) {
        console.warn(reason);
      });
    };

    // initially set spec
    service.updateSpec();

    return service;
  });
