'use strict';

angular.module('vegalite-ui')
  .filter('compactJSON', function() {
    return function(input) {
      return JSON.stringify(input, null, '  ', 80);
    };
  });
