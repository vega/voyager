'use strict';

/**
 * @ngdoc service
 * @name vleApp.Pills
 * @description
 * # Pills
 * Service in the vleApp.
 */
angular.module('vleApp')
  .service('Pills', function () {
    var Pills = {};

    Pills.getSchemaPill = function(field) {
      return {
        name: field.name,
        type: field.type,
        aggr: field.aggr
      };
    };

    return Pills;
  });
