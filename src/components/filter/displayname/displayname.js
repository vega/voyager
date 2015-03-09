'use strict';

angular.module('vleApp')
  .filter('displayName', function(Dataset) {
    return function(input) {
      var name = Dataset.dataset.displayNames ? Dataset.dataset.displayNames[input] : undefined;
      return name ? name : input;
    };
  });
