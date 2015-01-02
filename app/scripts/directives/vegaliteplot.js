'use strict';


angular.module('vleApp')
  .directive('vegalitePlot', function () {
    return {
      templateUrl: 'templates/vegaliteplot.html',
      restrict: 'E',
      controller: function ($scope, Vegalite) {
        $scope.Vegalite = Vegalite;

        var vis;

        $scope.$watch(
          function(){ return Vegalite.vegaSpec },
          function(newSpec) {
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
