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
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var Slider = require("rc-slider");
var React = require("react");
var CSSModules = require("react-css-modules");
var DateTimePicker = require("react-datetime");
var TetherComponent = require("react-tether");
var filter_1 = require("../../actions/filter");
var styles = require("./range-filter-shelf.scss");
var RangeFilterShelfBase = (function (_super) {
    __extends(RangeFilterShelfBase, _super);
    function RangeFilterShelfBase(props) {
        var _this = _super.call(this, props) || this;
        // TODO: https://github.com/vega/voyager/issues/443: use the time formatter Vega derives from D3
        _this.formatTime = function (value) {
            if (_this.props.type === expandedtype_1.ExpandedType.TEMPORAL) {
                return new Date(value).toString();
            }
            return value.toString();
        };
        _this.state = ({
            minDateTimePickerOpen: false,
            maxDateTimePickerOpen: false
        });
        _this.filterModifyExtent = _this.filterModifyExtent.bind(_this);
        _this.filterModifyMaxBound = _this.filterModifyMaxBound.bind(_this);
        _this.filterModifyMinBound = _this.filterModifyMinBound.bind(_this);
        _this.toggleMinDateTimePicker = _this.toggleMinDateTimePicker.bind(_this);
        _this.toggleMaxDateTimePicker = _this.toggleMaxDateTimePicker.bind(_this);
        return _this;
    }
    RangeFilterShelfBase.prototype.render = function () {
        var _a = this.props, filter = _a.filter, domain = _a.domain, type = _a.type;
        var createSliderWithTooltip = Slider.createSliderWithTooltip;
        var Range = createSliderWithTooltip(Slider.Range);
        var minInput, maxInput, formatLabel;
        if (type === expandedtype_1.ExpandedType.TEMPORAL) {
            minInput = this.renderDateTimePicker(new Date(filter.range[0]), 'min');
            maxInput = this.renderDateTimePicker(new Date(filter.range[1]), 'max');
            formatLabel = this.formatTime;
        }
        else {
            minInput = this.renderNumberInput('min');
            maxInput = this.renderNumberInput('max');
        }
        var lowerBound = Math.floor(Number(domain[0]));
        var upperBound = Math.ceil(Number(domain[1]));
        return (React.createElement("div", { styleName: 'range-filter-pane' },
            React.createElement("div", null,
                React.createElement("div", { styleName: 'bound' }, minInput),
                React.createElement("div", { styleName: 'bound' }, maxInput)),
            React.createElement(Range, { allowCross: false, defaultValue: [Number(filter.range[0]), Number(filter.range[1])], min: lowerBound, max: upperBound, onAfterChange: this.filterModifyExtent.bind(this), tipFormatter: formatLabel })));
    };
    RangeFilterShelfBase.prototype.filterModifyExtent = function (range) {
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        handleAction({
            type: filter_1.FILTER_MODIFY_EXTENT,
            payload: {
                index: index,
                range: range
            }
        });
    };
    RangeFilterShelfBase.prototype.filterModifyMaxBound = function (e) {
        var maxBound;
        if (e.hasOwnProperty('target')) {
            maxBound = e.target.value;
        }
        else {
            maxBound = e;
        }
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        handleAction({
            type: filter_1.FILTER_MODIFY_MAX_BOUND,
            payload: {
                index: index,
                maxBound: maxBound
            }
        });
    };
    RangeFilterShelfBase.prototype.filterModifyMinBound = function (e) {
        var minBound;
        if (e.hasOwnProperty('target')) {
            minBound = e.target.value;
        }
        else {
            minBound = e;
        }
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        handleAction({
            type: filter_1.FILTER_MODIFY_MIN_BOUND,
            payload: {
                index: index,
                minBound: minBound
            }
        });
    };
    RangeFilterShelfBase.prototype.renderNumberInput = function (bound) {
        var filter = this.props.filter;
        var onChangeAction, value;
        if (bound === 'min') {
            onChangeAction = this.filterModifyMinBound;
            value = filter.range[0];
        }
        else if (bound === 'max') {
            onChangeAction = this.filterModifyMaxBound;
            value = filter.range[1];
        }
        return (React.createElement("div", null,
            bound,
            ":",
            React.createElement("a", { onClick: this.focusInput.bind(this, filter.field + "_" + bound) },
                React.createElement("i", { className: "fa fa-pencil" })),
            React.createElement("input", { id: filter.field + "_" + bound, type: 'number', value: value.toString(), onChange: onChangeAction })));
    };
    RangeFilterShelfBase.prototype.renderDateTimePicker = function (date, bound) {
        var onChangeAction, dateTimePickerOpen, dataTimePickerOpenAction;
        if (bound === 'min') {
            onChangeAction = this.filterModifyMinBound;
            dateTimePickerOpen = this.state.minDateTimePickerOpen;
            dataTimePickerOpenAction = this.toggleMinDateTimePicker;
        }
        else if (bound === 'max') {
            onChangeAction = this.filterModifyMaxBound;
            dateTimePickerOpen = this.state.maxDateTimePickerOpen;
            dataTimePickerOpenAction = this.toggleMaxDateTimePicker;
        }
        return (React.createElement("div", null,
            React.createElement(TetherComponent, { attachment: 'bottom center' },
                React.createElement("div", { styleName: 'bound' },
                    bound,
                    ":",
                    React.createElement("a", { onClick: dataTimePickerOpenAction },
                        React.createElement("i", { className: "fa fa-pencil" })),
                    date.toString()),
                dateTimePickerOpen &&
                    React.createElement("div", { styleName: 'date-time-picker-wrapper' },
                        React.createElement(DateTimePicker, { defaultValue: date, open: false, onChange: onChangeAction })))));
    };
    RangeFilterShelfBase.prototype.focusInput = function (id) {
        document.getElementById(id).focus();
    };
    RangeFilterShelfBase.prototype.toggleMinDateTimePicker = function () {
        this.setState({
            minDateTimePickerOpen: !this.state.minDateTimePickerOpen
        });
    };
    RangeFilterShelfBase.prototype.toggleMaxDateTimePicker = function () {
        this.setState({
            maxDateTimePickerOpen: !this.state.maxDateTimePickerOpen
        });
    };
    return RangeFilterShelfBase;
}(React.PureComponent));
exports.RangeFilterShelfBase = RangeFilterShelfBase;
exports.RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
