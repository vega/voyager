'use strict';

// Service for the spec config.
// We keep this separate so that changes are kept even if the spec changes.
angular.module('polestar')
  .factory('Config', function(vl, _) {
    var Config = {};

    Config.schema = vl.schema.schema.properties.config;
    Config.config = vl.schema.util.instantiate(Config.schema);

    Config.getConfig = function() {
      return _.cloneDeep(Config.config);
    };

    Config.large = function() {
      return {
        singleWidth: 400,
        singleHeight: 400,
        largeBandMaxCardinality: 20
      };
    };

    Config.small = function() {
      return {};
    };

    Config.updateDataset = function(dataset, type) {
      Config.config.dataUrl = dataset.url;
      Config.config.dataFormatType = type;
    };

    return Config;
  });
