'use strict';

angular.module('vleApp')
  .service('EncodingSchema', function ($http) {
    var service = {};

    // generates a js object instance from a json schema
    service.instanceFromSchema = function(schema) {
      if (schema.type === 'object') {
        return _.mapValues(schema.properties, service.instanceFromSchema);
      } else if (_.has(schema, 'default')) {
        return schema.default;
      } else {
        return null;
      }
    };

    service.getEncodingSchema = function() {
      return $http.get('data/encoding.json', {cache: true}).then(function(response) {
        return response.data;
      });
    };

    return service;
  });
