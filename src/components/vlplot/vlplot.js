'use strict';

angular.module('vleApp')
  .directive('vlPlot', function(vg) {
    var counter = 0;

    return {
      templateUrl: 'components/vlplot/vlplot.html',
      restrict: 'E',
      scope: {
        'vgSpec':'=',
        'maxHeight':'='
      },
      link: function(scope, element) {
        scope.visId = (counter++);
        var view;
        scope.$watch('vgSpec',function(spec) {
          if (!spec) {
            if (view) {
              view.off('mouseover');
            }
            return;
          }
          var elem = element;
          if (elem) {
            vg.parse.spec(spec, function(chart) {
              view = null;
              view = chart({el: elem[0], renderer: 'canvas'});
              view.update();
              view.on('mouseover', function(event, item) {
                // TODO: Hanchuan please create tooltip from this
                console.log(item.datum.data);
              });
            });
          } else {
            console.error('can not find vis element');
          }
        });
      }
    };
  });
