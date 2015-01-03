'use strict';

// Service for the spec config.
// We keep this separate so that changes are kept even if the spec changes.
angular.module('vleApp')
  .factory('Config', function (VegaliteSpecSchema) {
    var service = {};

    service.config = null;
    service.schema = null;

    VegaliteSpecSchema.getSchema().then(function(schema) {
      service.schema = schema.properties.cfg;
      service.config = VegaliteSpecSchema.instanceFromSchema(service.schema);
    }, function(reason) {
      console.warn(reason);
    });

    service.updateDataset = function(dataset) {
      service.config.dataUrl = dataset.url;
      service.config.vegaServerTable = dataset.table;
    };

    return service;
  });
