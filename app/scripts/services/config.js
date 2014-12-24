'use strict';

// config service
angular.module('vleApp')
  .service('config', function () {
    this.conf = {
      useVegaServer: false
    }
  });
