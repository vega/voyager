'use strict';

// Service for the spec config.
// We keep this separate so that changes are kept even if the spec changes.
angular.module('vegalite-ui')
  .factory('Config', function(vl, consts) {
    var Config = {};

    Config.schema = vl.schema.schema.properties.cfg;
    Config.config = {};

    Config.updateDataset = function(dataset) {
      if (consts.useUrl) {
        Config.config.dataUrl = dataset.url;
      }

      Config.config.vegaServerTable = dataset.table;
    };

    return Config;
  });
