'use strict';

angular.module('vleApp')
  .directive('vlPlot', function(vg, $timeout) {
    var counter = 0;
    var MAX_CANVAS_SIZE = 32767, MAX_CANVAS_AREA = 268435456;

    function getRenderer(spec) {
      // use canvas by default but use svg if the visualization is too big
      if (spec.width > MAX_CANVAS_SIZE || spec.height > MAX_CANVAS_SIZE || spec.width*spec.height > MAX_CANVAS_AREA) {
        return 'svg';
      }
      return 'canvas';
    }

    return {
      templateUrl: 'components/vlplot/vlplot.html',
      restrict: 'E',
      scope: {
        'vgSpec':'=',
        'maxHeight':'='
      },
      link: function(scope, element) {
        scope.visId = (counter++);
        scope.hoverAction = null;
        scope.mouseover = function() {
          scope.hoverAction = $timeout(function(){
            scope.hoverFocus = true;
          }, 500);
        };

        scope.mouseout = function() {
          $timeout.cancel(scope.hoverAction);
          scope.hoverFocus = scope.unlocked = false;
        };

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
              view = chart({el: elem[0], renderer: getRenderer(spec)});
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
