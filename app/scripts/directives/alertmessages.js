'use strict';

angular.module('vleApp')
  .directive('alertMessages', function (Alerts) {
    return {
      templateUrl: 'templates/alertMessages.html',
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.Alerts = Alerts;
      }
    };
  });
