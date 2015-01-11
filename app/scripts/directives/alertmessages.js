'use strict';

angular.module('vleApp')
  .directive('alertMessages', function (Alerts) {
    return {
      templateUrl: 'templates/alertmessages.html',
      restrict: 'E',
      scope: {},
      link: function(scope, element, attrs) {
        scope.Alerts = Alerts;
      }
    };
  });
