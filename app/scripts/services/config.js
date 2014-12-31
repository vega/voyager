'use strict';

angular.module('vleApp')
  .factory('Config', function () {
  	var service = {};

  	service.useServer = false;
  	service.serverUrl =  vl.DEFAULTS.vegaServerUrl;

    return service;
  });
