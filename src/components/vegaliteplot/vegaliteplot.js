'use strict';

angular.module('vleApp')
  .directive('vegalitePlot', function () {
    return {
      templateUrl: 'components/vegaliteplot/vegaliteplot.html',
      restrict: 'E',
      scope: {},
      controller: function ($scope, vg, Spec) {
        var update = function() {
          $scope.vgSpec = Spec.vgSpec;
          $scope.vlSpec = Spec.vlSpec;
          $scope.shorthand = Spec.shorthand;
        };

        $scope.parseShorthand = Spec.parseShorthand;

        var vis;

        $scope.$watch(
          function(){ return Spec.vgSpec; },
          function(newSpec) {
            if (!newSpec) {
              return;
            }

            update();
            console.log(Spec, vg);
            vg.parse.spec(newSpec, function(chart) {
              vis = null;
              vis = chart({el:'#vis', renderer: 'svg'});

              vis.update();
              vis.on('mouseover', function(event, item) { console.log(item, item.datum.data); });
            });
          }
        );
      }
    };
  });
