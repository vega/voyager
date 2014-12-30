'use strict';

angular.module('vleApp')
  .factory('Encoding', function (Marks) {
    var service = _.map(Marks, function(mark) {
      // add a value that's the default to the encoding
      mark.field = null;
      mark.config = _.mapValues(mark.config, function(type) {
      	return _.mapValues(type, function(property) {
	      	return _.map(property, function(config) {
	      		return _.assign(config, { value: config.default });
	      	});
      	});
      });
      mark.types = _.keys(mark.config),
      mark.type = _.has(mark.config, 'Q') ? 'Q' : 'O';
      return mark;
    });

    return service;
  });
