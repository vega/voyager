'use strict';

// config service
angular.module('vleApp')
  .service('configService', function () {
    this.conf = {
      useVegaServer: false
    }
  });
