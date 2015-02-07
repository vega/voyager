'use strict';

angular.module('vleApp')
  .directive('vlPlot', function(vg) {
    var counter = 0 ;

    return {
      templateUrl: 'components/vlplot/vlplot.html',
      restrict: 'E',
      scope: {
        'vgSpec':'='
      },
      // replace: true,
      link: function(scope, element) {
        scope.visId = (counter++);
        var vis;
        var dewatch = scope.$watch('vgSpec',function(spec) {
          if (!spec) {
            return;
          }
          var elem = element.find('#vis-'+scope.visId);
          if (elem) {
            vg.parse.spec(spec, function(chart) {
              vis = null;
              vis = chart({el: elem[0], renderer: 'canvas'});
              vis.update();
            });
          } else {
            console.error('can not find vis element');
          }

        });
      }
    };
  });
