'use strict';

angular.module('vleApp')
  .factory('Config', function () {
  	var service = {}

  	service.useServer = true;
  	service.serverUrl =  vl.DEFAULTS.vegaServerUrl;

    return service;
  });
