'use strict';

// Service for the spec config.
// We keep this separate so that changes are kept even if the spec changes.
angular.module('vleApp')
  .factory('Config', function (vl) {
    var service = {};

    service.schema = vl.schema.schema.properties.cfg;
    service.config = vl.schema.util.instantiate(service.schema);

    service.updateDataset = function(dataset) {
      service.config.dataUrl = dataset.url;
      service.config.vegaServerTable = dataset.table;
    };

    return service;
  });
