'use strict';

angular.module('vleApp')
  .directive('jsonInput', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {},
      link: function(scope, element, attrs, modelCtrl) {
        var format = function(inputValue) {
          return JSON.stringify(inputValue, null, '  ', 80);
        };
        modelCtrl.$formatters.push(format);
      }
    };
  });
