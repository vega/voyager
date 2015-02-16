'use strict';

/**
 * @ngdoc service
 * @name vegalite-ui.logger
 * @description
 * # logger
 * Service in the vegalite-ui.
 */
angular.module('vleApp')
  .service('Logger', function (localStorageService, consts) {

    var service = {};

    var timeStamp = function() {
      var now = new Date();
      var date = [ now.getFullYear(), now.getMonth() + 1, now.getDate()];
      var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
      for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
          time[i] = "0" + time[i];
        }
      }
      return date.join("-") + " " + time.join(":");
    }

    service.logInteraction = function(action) {
      console.log(consts);
      if (!consts.logging)
        return;
      var key = timeStamp();
      localStorageService.set(key, action);
    }

    service.clear = function() {
      localStorageService.clearAll();
    }

    return service;
  });
