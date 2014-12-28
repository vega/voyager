'use strict';

angular.module('vleApp')
  .factory('Encoding', function (Marks) {
    var service = _.map(Marks, function(mark) {
      // add a default type to the encoding
      mark.config = _.mapValues(mark.config, function(type) {
      	return _.mapValues(type, function(property) {
	      	return _.map(property, function(config) {
	      		return _.assign(config, { value: config.default });
	      	});
      	});
      });
      return _.assign(mark, {type: _.has(mark.config, 'Q') ? 'Q' : 'O'})
    });

    console.log(service)

    return service;
  });
