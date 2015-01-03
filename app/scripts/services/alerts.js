'use strict';

angular.module('vleApp')
  .service('Alerts', function () {
    var service = {};

    service.alerts = [];

    service.add = function(msg) {
      service.alerts.push({'msg': msg});
    };

    service.closeAlert = function(index) {
      service.alerts.splice(index, 1);
    };

    return service;
  });
