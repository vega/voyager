'use strict';

angular.module('vleApp')
  .directive('vlPlot', function() {
    return {
      templateUrl: 'components/vlplot/vlplot.html',
      restrict: 'E',
      scope: {},
      controller: function($scope, vg, Spec) {
        var update = function() {
          $scope.vgSpec = Spec.vgSpec;
          $scope.vlSpec = Spec.vlSpec;
          $scope.shorthand = Spec.shorthand;
        };

        $scope.parseShorthand = Spec.parseShorthand;

        var vis;

        $scope.$watch(
          function() { return Spec.vgSpec; },
          function(newSpec) {
            if (!newSpec) {
              return;
            }

            update();
            vg.parse.spec(newSpec, function(chart) {
              vis = null;
              vis = chart({el: '#vis', renderer: 'svg'});

              vis.update();
            });
          }
        );
      }
    };
  });
