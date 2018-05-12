"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_spinners_1 = require("react-spinners");
var vega = require("vega");
var vl = require("vega-lite");
var data_1 = require("vega-lite/build/src/data");
var vegaTooltip = require("vega-tooltip");
var constants_1 = require("../../constants");
var CHART_REF = 'chart';
var VegaLite = (function (_super) {
    __extends(VegaLite, _super);
    function VegaLite(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            isLoading: true
        };
        return _this;
    }
    VegaLite.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(react_spinners_1.ClipLoader, { color: constants_1.SPINNER_COLOR, loading: this.state.isLoading }),
            React.createElement("div", { className: 'chart', ref: CHART_REF }),
            React.createElement("div", { id: "vis-tooltip", className: "vg-tooltip" })));
    };
    VegaLite.prototype.componentDidMount = function () {
        var _this = this;
        if (this.mountTimeout) {
            clearTimeout(this.mountTimeout);
        }
        this.setState({
            isLoading: true
        });
        this.mountTimeout = window.setTimeout(function () {
            _this.updateSpec();
            _this.runView();
            _this.setState({
                isLoading: false
            });
        });
    };
    VegaLite.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.spec !== this.props.spec) {
            this.setState({
                isLoading: true
            });
            this.size = this.getChartSize();
        }
    };
    VegaLite.prototype.componentDidUpdate = function (prevProps, prevState) {
        var _this = this;
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        this.updateTimeout = window.setTimeout(function (spec, data) {
            if (prevProps.spec !== spec) {
                var chart = _this.refs[CHART_REF];
                chart.style.width = _this.size.width + 'px';
                chart.style.height = _this.size.height + 'px';
                _this.updateSpec();
            }
            else if (prevProps.data !== data) {
                _this.bindData();
            }
            _this.runView();
            _this.setState({
                isLoading: false
            });
        }, 0, this.props.spec, this.props.data);
    };
    VegaLite.prototype.componentWillUnmount = function () {
        if (this.mountTimeout) {
            clearTimeout(this.mountTimeout);
        }
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        if (this.view) {
            this.view.finalize();
        }
    };
    VegaLite.prototype.updateSpec = function () {
        // NOTE: spec used to test warning logger
        // vlSpec = {
        //   "description": "A simple bar chart with embedded data.",
        //   "data": {
        //     "values": [
        //       {"a": "A", "b": 28},
        //       {"a": "B", "b": 55},
        //       {"a": "C", "b": 43},
        //       {"a": "D", "b": 91},
        //       {"a": "E", "b": 81},
        //       {"a": "F", "b": 53},
        //       {"a": "G", "b": 19},
        //       {"a": "H", "b": 87},
        //       {"a": "I", "b": 52}
        //     ]
        //   },
        //   "mark": "bar",
        //   "encoding": {
        //     "x": {"field": "a", "type": "quantitative"},
        //     "y": {"field": "b", "type": "quantitative"}
        //   }
        // };
        var logger = this.props.logger;
        var vlSpec = this.props.spec;
        try {
            var spec = vl.compile(vlSpec, logger).spec;
            var runtime = vega.parse(spec, vlSpec.config);
            this.view = new vega.View(runtime)
                .logLevel(vega.Warn)
                .initialize(this.refs[CHART_REF])
                .renderer(this.props.renderer || 'canvas')
                .hover();
            vegaTooltip.vega(this.view);
            this.bindData();
        }
        catch (err) {
            logger.error(err);
        }
    };
    VegaLite.prototype.bindData = function () {
        var _a = this.props, data = _a.data, spec = _a.spec;
        if (data && data_1.isNamedData(spec.data)) {
            this.view.change(spec.data.name, vega.changeset()
                .remove(function () { return true; }) // remove previous data
                .insert(data.values));
        }
    };
    VegaLite.prototype.runView = function () {
        try {
            this.view.run();
            if (this.props.viewRunAfter) {
                this.view.runAfter(this.props.viewRunAfter);
            }
        }
        catch (err) {
            this.props.logger.error(err);
        }
    };
    VegaLite.prototype.getChartSize = function () {
        var chart = this.refs[CHART_REF];
        var chartContainer = chart.querySelector(this.props.renderer || 'canvas');
        var width = Number(chartContainer.getAttribute('width'));
        var height = Number(chartContainer.getAttribute('height'));
        return { width: width, height: height };
    };
    return VegaLite;
}(React.PureComponent));
exports.VegaLite = VegaLite;
//# sourceMappingURL=index.js.map