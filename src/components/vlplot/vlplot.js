'use strict';

angular.module('vleApp')
  .directive('vlPlot', function(vl, vg, $timeout, $q, Dataset, Config, consts, _, $document, Logger) {
    var counter = 0;
    var MAX_CANVAS_SIZE = 32767/2, MAX_CANVAS_AREA = 268435456/4;

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
        'vgSpec':'=',
        'vlSpec': '=',
        'shorthand': '=',
        'maxHeight':'=',
        'maxWidth': '=',
        'alwaysScrollable': '=',
        'overflow': '=',
        'tooltip': '=',
        'configSet': '@'
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

        scope.mouseover = function() {
          scope.hoverPromise = $timeout(function(){
            Logger.logInteraction(Logger.actions.CHART_MOUSEOVER, scope.vlSpec);
            scope.hoverFocus = true;
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
          var encoding = vl.Encoding.fromSpec(scope.vlSpec, {
            cfg: Config[configSet]()
          });
          return vl.compile(encoding, Dataset.stats);
        }

        function render(spec) {
          var start = new Date().getTime();
          scope.height = spec.height;
          if (!element) {
            console.error('can not find vis element');
          }

          var shorthand = scope.shorthand || (scope.vlSpec ? vl.Encoding.shorthandFromSpec(scope.vlSpec) : '');

          scope.renderer = getRenderer(spec);

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

            var endChart = new Date().getTime();
            console.log('parse spec', (endParse-start), 'charting', (endChart-endParse), shorthand);
            if (scope.tooltip) {
              view.on('mouseover', viewOnMouseOver);

              view.on('mouseout', viewOnMouseOut);
            }

          });
        }

        var view;
        scope.$watch('vgSpec',function() {
          var spec = getVgSpec();
          if (!spec) {
            if (view) {
              view.off('mouseover');
              view.off('mouseout');
            }
            return;
          }

          render(spec);
        }, true);

        scope.$watch('vlSpec', function() {
          var vgSpec = getVgSpec();
          if (vgSpec) { return; } //no need to update

          var spec = getCompiledSpec();
          render(spec);
        }, true);
      }
    };
  });
