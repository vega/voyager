'use strict';

angular.module('vleApp')
  .directive('vlPlot', function(vg, $timeout, $q, Dataset, consts) {
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
        'encoding': '=',
        'maxHeight':'='
      },
      replace: true,
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

        function render() {
          var start = new Date().getTime();
          var spec= scope.vgSpec;
          var shorthand = scope.encoding ? scope.encoding.toShorthand() : '';

          scope.renderer = getRenderer(spec);

          vg.parse.spec(spec, function(chart) {
            var endParse = new Date().getTime();
            console.log('parse spec', (endParse-start), shorthand);
            view = null;
            view = chart({el: element[0], renderer: scope.renderer});
            if (!consts.useUrl) {
              view.data({table: Dataset.data});
            }
            view.update();

            if (scope.renderer === 'canvas') {
              scope.height = element.find('canvas').style('height');
            }

            var endChart = new Date().getTime();
            console.log('charting', (endChart-endParse), shorthand);

            view.on('mouseover', function(event, item) {
              // TODO: Hanchuan please create tooltip from this
              console.log(item.datum.data);
            });
          });
        }

        var view;
        scope.$watch('vgSpec',function(spec) {
          if (!spec) {
            if (view) {
              view.off('mouseover');
            }
            return;
          }

          scope.height = spec.height;

          if (element) {
            // $timeout(render, 10);
            render();
          } else {
            console.error('can not find vis element');
          }
        });
      }
    };
  });
