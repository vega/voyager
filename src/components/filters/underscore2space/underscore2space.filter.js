'use strict';

/**
 * @ngdoc filter
 * @name vegalite-ui.filter:underscore2space
 * @function
 * @description
 * # underscore2space
 * Filter in the vegalite-ui.
 */
angular.module('vleApp')
  .filter('underscore2space', function () {
    return function (input) {
      return input ? input.replace(/_+/g, ' ') : '';
    };
  });