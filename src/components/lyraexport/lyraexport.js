'use strict';

angular.module('polestar')
  .directive('lyraExport', function() {
    return {
      template: '<a href="#" class="command" ng-click="export()">Export to lyra</a>',
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function($scope, $timeout, Spec, Alerts) {
        $scope.export = function() {
          var vgSpec = Spec.vgSpec;
          if (!vgSpec) {
            Alerts.add('No vega spec present.');
          }

          // Hack needed. See https://github.com/uwdata/lyra/issues/214
          vgSpec.marks[0]['lyra.groupType'] = 'layer';

          var lyraURL = 'http://idl.cs.washington.edu/projects/lyra/app/';
          var lyraWindow = window.open(lyraURL, '_blank');

          // HACK
          // lyraWindow.onload doesn't work across domains
          $timeout(function() {
            Alerts.add('Please check whether lyra loaded the vega spec correctly. This feature is experimental and may not work.', 5000);
            lyraWindow.postMessage({spec: vgSpec}, lyraURL);
          }, 5000);
        };
      }
    };
  });
