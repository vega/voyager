'use strict';

angular.module('vleApp')
  .service('Alerts', function ($timeout) {
    var service = {};

    service.alerts = [];

    service.add = function(msg, dismiss) {
      var message = {msg: msg};
      service.alerts.push(message);
      if (dismiss) {
        $timeout(function() {
          var index = _.findIndex(service.alerts, message);
          service.closeAlert(index);
        }, dismiss);
      }
    };

    service.closeAlert = function(index) {
      service.alerts.splice(index, 1);
    };

    return service;
  });
