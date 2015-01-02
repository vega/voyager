'use strict';

angular.module('vleApp')
  .factory('Encoding', function ($http) {
    // generates a js object instance from a json schema
    var instanceFromSchema = function(schema) {
      if (schema.type === 'object') {
        return _.mapValues(schema.properties, instanceFromSchema);
      } else if (_.has(schema, 'default')) {
        return schema.default;
      } else if (schema.enum && !_.has(schema.enum, null)) {
        return schema.enum[0];
      } else {
        return null;
      }
    };

    var url = 'data/encoding.json';

    return {
      getEncoding: function() {
        return $http.get(url, {cache: true}).then(function(response) {
          return instanceFromSchema(response.data);
        });
      },
      getEncodingSchema: function() {
        return $http.get(url, {cache: true}).then(function(response) {
          return response.data;
        });
      },
      instanceFromSchema: instanceFromSchema
    }
  });
