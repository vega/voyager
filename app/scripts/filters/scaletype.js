'use strict';

angular.module('vleApp')
  .filter('scaleType', function () {
    return function (input) {
      var scaleTypes = {
        Q: 'Quantitative',
        O: 'Ordinal',
        T: 'Time'
      };

      return scaleTypes[input];
    };
  });
