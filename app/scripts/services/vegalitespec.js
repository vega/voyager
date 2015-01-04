'use strict';

// This module has an extended spec with a lot of empty fields
angular.module('vleApp')
  .factory('VegaliteSpec', function ($http, Config, VegaliteSpecSchema, Vegalite) {
    var service = {};

    service.spec = null;

    // sets the spec from a shorthand
    service.parseShorthand = function(newShorthand) {
      service.spec = vl.Encoding.parseShorthand(newShorthand, Config.config).toSpec();
      Vegalite.updateVegaliteSpec(service.spec);
    };

    // resets the spec to a new spec generated form the schema
    service.resetSpec = function() {
      VegaliteSpecSchema.getSchema().then(function(schema) {
        service.spec = VegaliteSpecSchema.instanceFromSchema(schema);
      }, function(reason) {
        console.warn(reason);
      });
    };

    // initially set spec
    service.resetSpec();

    return service;
  });
