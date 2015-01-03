'use strict';


angular.module('vleApp')
  .directive('vegalitePlot', function () {
    return {
      templateUrl: 'templates/vegaliteplot.html',
      restrict: 'E',
      controller: function ($scope, Vegalite, Encoding) {
        var update = function() {
          $scope.vegaSpec = Vegalite.vegaSpec;
          $scope.encoding = Vegalite.encoding;
          $scope.shorthand = Vegalite.shorthand;
        };

        $scope.parseShorthand = function(shorthand) {
          Encoding.parseShorthand(shorthand)
          // TODO
        }

        var vis;

        $scope.$watch(
          function(){ return Vegalite.vegaSpec },
          function(newSpec) {
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
