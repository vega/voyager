'use strict';

angular.module('vleApp')
  .directive('vlPlot', function() {
    var counter = 0 ;

    return {
      templateUrl: 'components/vlplot/vlplot.html',
      restrict: 'E',
      scope: {
        'vlSpec':'=',
        'vgSpec':'=',
        'visClass': '=',
        'showCopy': '='
      },
      controller: function($scope, vg) {
        $scope.visId = (counter++);
        var vis;
        $scope.$watch('vgSpec',function(spec) {
          if (!spec) {
            return;
          }
          vg.parse.spec(spec, function(chart) {
            vis = null;
            vis = chart({el: '#vis-'+$scope.visId, renderer: 'canvas'});
            vis.update();
          });
        });
      }
    };
  });
