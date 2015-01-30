'use strict';

angular.module('vleApp')
  .filter('compactJSON', function() {
    return function(input) {
      return JSON.stringify(input, null, '  ', 80);
    };
  });
