'use strict';

angular.module('vleApp')
  .directive('vlPlot', function(vl, vg, $timeout, $q, Dataset, Config, consts, _, $document, Logger) {
    var counter = 0;
    var MAX_CANVAS_SIZE = 32767/2, MAX_CANVAS_AREA = 268435456/4;

    var renderQueue = [],
      rendering = false;

    function getRenderer(width, height) {
      // use canvas by default but use svg if the visualization is too big
      if (width > MAX_CANVAS_SIZE || height > MAX_CANVAS_SIZE || width*height > MAX_CANVAS_AREA) {
        return 'svg';
      }
      return 'canvas';
    }

    return {
      templateUrl: 'components/vlplot/vlplot.html',
      restrict: 'E',
      scope: {
        vgSpec: '=',
        vlSpec: '=',
        disabled: '=',
        isInList: '=',
        fieldSetKey: '=',
        shorthand: '=',
        maxHeight:'=',
        maxWidth: '=',
        alwaysScrollable: '=',
        overflow: '=',
        tooltip: '=',
        configSet: '@',
        rescale: '=',
        thumbnail: '='
      },
      replace: true,
      link: function(scope, element) {
        var HOVER_TIMEOUT = 500,
          TOOLTIP_TIMEOUT = 250;

        scope.visId = (counter++);
        scope.hoverPromise = null;
        scope.tooltipPromise = null;
        scope.hoverFocus = false;
        scope.tooltipActive = false;
        scope.destroyed = false;

        scope.mouseover = function() {
          scope.hoverPromise = $timeout(function(){
            Logger.logInteraction(Logger.actions.CHART_MOUSEOVER, scope.vlSpec);
            scope.hoverFocus = !scope.thumbnail;
          }, HOVER_TIMEOUT);
        };

        scope.mouseout = function() {
          if (scope.hoverFocus) {
            Logger.logInteraction(Logger.actions.CHART_MOUSEOUT, scope.vlSpec);
          }

          $timeout.cancel(scope.hoverPromise);
          scope.hoverFocus = scope.unlocked = false;
        };

        function viewOnMouseOver(event, item) {
          if (!item.datum.data) { return; }

          scope.tooltipPromise = $timeout(function activateTooltip(){
            scope.tooltipActive = true;
            Logger.logInteraction(Logger.actions.CHART_TOOLTIP, item.datum);

            // convert data into a format that we can easily use with ng table and ng-repeat
            // TODO: revise if this is actually a good idea
            scope.data = _.pairs(item.datum.data).map(function(p) {
              p.isNumber = vg.isNumber(p[1]);
              return p;
            });
            scope.$digest();

            var tooltip = element.find('.vis-tooltip'),
              $body = angular.element($document),
              width = tooltip.width(),
              height= tooltip.height();

            // put tooltip above if it's near the screen's bottom border
            if (event.pageY+10+height < $body.height()) {
              tooltip.css('top', (event.pageY+10));
            } else {
              tooltip.css('top', (event.pageY-10-height));
            }

            // put tooltip on left if it's near the screen's right border
            if (event.pageX+10+ width < $body.width()) {
              tooltip.css('left', (event.pageX+10));
            } else {
              tooltip.css('left', (event.pageX-10-width));
            }
          }, TOOLTIP_TIMEOUT);
        }

        function viewOnMouseOut() {
          //clear positions
          var tooltip = element.find('.vis-tooltip');
          tooltip.css('top', null);
          tooltip.css('left', null);
          $timeout.cancel(scope.tooltipPromise);
          scope.tooltipActive = false;
          scope.data = [];
          scope.$digest();
        }

        function getVgSpec() {
          return consts.defaultConfigSet && scope.configSet && consts.defaultConfigSet !== scope.configSet ? null : scope.vgSpec;
        }

        function getCompiledSpec() {
          var configSet = scope.configSet || consts.defaultConfigSet || {};

          var vlSpec = _.cloneDeep(scope.vlSpec);
          vl.merge(vlSpec.cfg, Config[configSet]());

          var encoding = vl.Encoding.fromSpec(vlSpec);
          return vl.compile(encoding, Dataset.stats);
        }

        function rescaleIfEnable() {
          if (scope.rescale) {
            var xRatio = scope.maxWidth > 0 ?  scope.maxWidth / scope.width : 1;
            var yRatio = scope.maxHeight > 0 ? scope.maxHeight / scope.height  : 1;
            var ratio = Math.min(xRatio, yRatio);

            var niceRatio = 1;
            while (0.75 * niceRatio> ratio) {
              niceRatio /= 2;
            }

            var t = niceRatio * 100 / 2 && 0;
            element.find('.vega').css('transform', 'translate(-'+t+'%, -'+t+'%) scale('+niceRatio+')');
          } else {
            element.find('.vega').css('transform', null);
          }
        }

        function renderQueueNext() {
          // render next item in the queue
          if (renderQueue.length > 0) {
            renderQueue.shift()();
          } else {
            // or say that no one is rendering
            rendering = false;
          }
        }

        function render(spec) {
          if (!spec) {
            if (view) {
              view.off('mouseover');
              view.off('mouseout');
            }
            return;
          }

          scope.height = spec.height;
          if (!element) {
            console.error('can not find vis element');
          }

          var shorthand = scope.shorthand || (scope.vlSpec ? vl.Encoding.shorthandFromSpec(scope.vlSpec) : '');

          scope.renderer = getRenderer(spec);

          function parseVega() {
            // if no longer a part of the list, cancel!
            if (scope.destroyed || scope.disabled || (scope.isInList && scope.fieldSetKey && !scope.isInList(scope.fieldSetKey))) {
              console.log('cancel rendering', shorthand);
              renderQueueNext();
              return;
            }

            var start = new Date().getTime();
            // render if still a part of the list
            vg.parse.spec(spec, function(chart) {
              var endParse = new Date().getTime();
              view = null;
              view = chart({el: element[0]});

              if (!consts.useUrl) {
                view.data({raw: Dataset.data});
              }

              scope.width =  view.width();
              scope.height = view.height();
              view.renderer(getRenderer(spec.width, scope.height));
              view.update();

              Logger.logInteraction(Logger.actions.CHART_RENDER, scope.vlSpec);
                rescaleIfEnable();

              var endChart = new Date().getTime();
              console.log('parse spec', (endParse-start), 'charting', (endChart-endParse), shorthand);
              if (scope.tooltip) {
                view.on('mouseover', viewOnMouseOver);
                view.on('mouseout', viewOnMouseOut);
              }

              renderQueueNext();
            });
          }

          if (!rendering) { // if no instance is being render -- rendering now
            rendering=true;
            parseVega();
          } else {
            // otherwise queue it
            renderQueue.push(parseVega);
          }
        }

        var view;
        scope.$watch('vgSpec',function() {
          var spec = getVgSpec();
          render(spec);
        }, true);

        scope.$watch('vlSpec', function() {
          var vgSpec = getVgSpec();
          if (vgSpec) { return; } //no need to update

          var spec = getCompiledSpec();
          render(spec);
        }, true);

        scope.$on('$destroy', function() {
          console.log('vlplot destroyed');
          view.off('mouseover');
          view.off('mouseout');
          view = null;
          scope.destroyed = true;
          // FIXME another way that should eliminate things from memory faster should be removing
          // maybe something like
          // renderQueue.splice(renderQueue.indexOf(parseVega), 1));
          // but without proper testing, this is riskier than setting scope.destroyed.
        });
      }
    };
  });
