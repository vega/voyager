'use strict';

// Service for the encoding config.
// We keep this separate so that changes are kept even if the encoding changes.
angular.module('vleApp')
  .factory('Config', function (EncodingSchema) {
    var service = {};

    service.config = null;
    service.schema = null;

    EncodingSchema.getEncodingSchema().then(function(schema) {
      service.schema = schema.properties.cfg;
      service.config = EncodingSchema.instanceFromSchema(service.schema);
    }, function(reason) {
      console.warn(reason);
    });

    service.updateDataset = function(dataset) {
      service.config.dataUrl = dataset.url;
      service.config.vegaServerTable = dataset.table;
    };

    return service;
  });
