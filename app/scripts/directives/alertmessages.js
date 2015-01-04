'use strict';

angular.module('vleApp')
  .directive('alertMessages', function (Alerts) {
    return {
      templateUrl: 'templates/alertmessages.html',
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.Alerts = Alerts;
      }
    };
  });
