'use strict';

angular.module('voyager2')
  .directive('jsonInput', function(JSON3) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {},
      link: function(scope, element, attrs, modelCtrl) {
        var format = function(inputValue) {
          return JSON3.stringify(inputValue, null, '  ', 80);
        };
        modelCtrl.$formatters.push(format);
      }
    };
  });
