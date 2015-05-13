'use strict';

/**
 * @ngdoc filter
 * @name vega-lite-ui.filter:encodeUri
 * @function
 * @description
 * # encodeUri
 * Filter in the vega-lite-ui.
 */
angular.module('polestar')
  .filter('encodeURI', function () {
    return function (input) {
      return window.encodeURI(input);
    };
  });