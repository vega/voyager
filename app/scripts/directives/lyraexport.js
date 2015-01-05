'use strict';

angular.module('vleApp')
  .directive('lyraExport', function () {
    return {
      template: '<a href="#" ng-click="export()">export to lyra...</a>',
      restrict: 'E',
      controller: function ($scope, $timeout, Vegalite, Alerts) {
        $scope.export = function() {
          var vegaSpec = Vegalite.vegaSpec;
          if (!vegaSpec) {
            Alerts.add('No vega spec present.');
          }

          var lyraURL = 'http://idl.cs.washington.edu/projects/lyra/app/';
          var lyraWindow = window.open(lyraURL, '_blank');

          // HACK
          // lyraWindow.onload doesn't work across domains
          $timeout(function() {
            Alerts.add('Please check whether lyra loaded the vega spec correctly. This feature is experimental and may not work.', 5000);
            lyraWindow.postMessage({spec: vegaSpec}, lyraURL);
          }, 5000);
        }
      }
    };
  });
