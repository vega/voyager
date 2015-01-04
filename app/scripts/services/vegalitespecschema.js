'use strict';

angular.module('vleApp')
  .service('VegaliteSpecSchema', function ($http) {
    var service = {};

    // generates a js object instance from a json schema
    service.instanceFromSchema = function(schema, required) {
      if (schema.type === 'object') {
        schema.required = schema.required ? schema.required : [];
        return _.mapValues(schema.properties, function(child, name) {
          return service.instanceFromSchema(child, _.contains(schema.required , name));
        });
      } else if (_.has(schema, 'default')) {
        return schema.default;
      } else if (schema.enum && required) {
        return schema.enum[0];
      }
      return null;
    };

    service.getSchema = function() {
      return $http.get('data/spec.json', {cache: true}).then(function(response) {
        return response.data;
      });
    };

    return service;
  });
