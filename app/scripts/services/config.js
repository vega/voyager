'use strict';

// Service for the encoding config.
// We keep this separate so that changes are kept even if the encoding changes.
angular.module('vleApp')
  .factory('Config', function (Encoding) {
    var service = {};

    service.config = null;

    Encoding.getEncodingSchema().then(function(schema) {
      service.config = Encoding.instanceFromSchema(schema.properties.cfg);
    }, function(reason) {
      console.warn(reason);
    });

    service.updateDataset = function(dataset) {
      service.config.dataUrl = dataset.url;
      service.config.vegaServerTable = dataset.table;
    };

    return service;
  });
