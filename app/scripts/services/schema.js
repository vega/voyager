'use strict';

// shcmea service
angular.module('vleApp')
  .service('schema', ['config', function(config) {
    this.getSchema = function(dataset) {
      if (config.useVegaServer) {
        return "server";
      } else {
        return "client";
      }
    }
  }]);
