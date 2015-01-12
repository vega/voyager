'use strict';

angular.module('vleApp')
  .directive('vegalitePlot', function () {
    return {
      templateUrl: 'templates/vegaliteplot.html',
      restrict: 'E',
      scope: {},
      controller: function ($scope, Vegalite, VegaliteSpec) {
        var update = function() {
          $scope.vgSpec = Vegalite.vgSpec;
          $scope.vlSpec = Vegalite.vlSpec;
          $scope.shorthand = Vegalite.shorthand;
        };

        $scope.parseShorthand = function(shorthand) {
          VegaliteSpec.parseShorthand(shorthand);
        };

        var vis;

        $scope.$watch(
          function(){ return Vegalite.vgSpec; },
          function(newSpec) {
            if (!newSpec) {
              return;
            }

            update();
            vg.parse.spec(newSpec, function(chart) {
              vis = null;
              vis = chart({el:'#vis', renderer: 'svg'});

              vis.update();
            });
          }
        );
      }
    };
  });
