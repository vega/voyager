'use strict';

// Service for the spec config.
// We keep this separate so that changes are kept even if the spec changes.
angular.module('vleApp')
  .factory('Config', function(vl) {
    var Config = {};

    Config.schema = vl.schema.schema.properties.cfg;
    Config.config = vl.schema.util.instantiate(Config.schema);

    Config.large = function() {
      var config = vl.merge({}, Config.config, {
        singleWidth: 500,
        singleHeight: 500,
        largeBandMaxCardinality: 20
      });

      return vl.duplicate(config);
    };

    Config.small = function() {
      var config = vl.merge({}, Config.config);
      return vl.duplicate(config);
    };

    Config.updateDataset = function(dataset) {
      Config.config.dataUrl = dataset.url;
      Config.config.vegaServerTable = dataset.table;
    };

    return Config;
  });
