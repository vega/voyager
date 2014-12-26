'use strict';

angular.module('vleApp')
  .factory('Config', function () {
  	var useVegaServer = false;
    return {
      useVegaServer: useVegaServer
    };
  });
