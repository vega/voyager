'use strict';

// schema service
angular.module('vleApp')
  .service('schemaService', ['configService', function(config) {
    this.getSchema = function(dataset) {
      if (config.useVegaServer) {
        return [];
      } else {
        return [];
      }
    }
  }]);
