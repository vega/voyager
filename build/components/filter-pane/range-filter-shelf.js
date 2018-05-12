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
var Slider = require("rc-slider");
var React = require("react");
var CSSModules = require("react-css-modules");
var DateTimePicker = require("react-datetime");
var TetherComponent = require("react-tether");
var timeunit_1 = require("vega-lite/build/src/timeunit");
var actions_1 = require("../../actions");
var filter_1 = require("../../models/shelf/filter");
var styles = require("./range-filter-shelf.scss");
var RangeFilterShelfBase = (function (_super) {
    __extends(RangeFilterShelfBase, _super);
    function RangeFilterShelfBase(props) {
        var _this = _super.call(this, props) || this;
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
        var _a = this.props, filter = _a.filter, domain = _a.domain, renderDateTimePicker = _a.renderDateTimePicker;
        var createSliderWithTooltip = Slider.createSliderWithTooltip;
        var Range = createSliderWithTooltip(Slider.Range);
        var minInput, maxInput, currMin, currMax, lowerBound, upperBound;
        if (renderDateTimePicker) {
            // when render date time picker, it must be an temporal filter, thus the range must be DateTime[].
            minInput = this.renderDateTimePicker(new Date(filter_1.convertToTimestamp(filter.range[0])), 'min');
            maxInput = this.renderDateTimePicker(new Date(filter_1.convertToTimestamp(filter.range[1])), 'max');
            currMin = filter_1.convertToTimestamp(filter.range[0]);
            currMax = filter_1.convertToTimestamp(filter.range[1]);
            lowerBound = Math.floor(filter_1.convertToTimestamp(domain[0]));
            upperBound = Math.ceil(filter_1.convertToTimestamp(domain[1]));
        }
        else {
            minInput = this.renderNumberInput('min');
            maxInput = this.renderNumberInput('max');
            currMin = filter.range[0];
            currMax = filter.range[1];
            // Math.floor/ceil because the slider requires the the difference between max and min
            // must be a multiple of step (which is 1 by default)
            lowerBound = Math.floor(Number(domain[0]));
            upperBound = Math.ceil(Number(domain[1]));
        }
        return (React.createElement("div", { styleName: 'range-filter-pane' },
            React.createElement("div", null,
                React.createElement("div", { styleName: 'bound' }, minInput),
                React.createElement("div", { styleName: 'bound' }, maxInput)),
            React.createElement(Range, { allowCross: false, defaultValue: [currMin, currMax], min: lowerBound, max: upperBound, onAfterChange: this.filterModifyExtent.bind(this), tipFormatter: this.getFormat(renderDateTimePicker, filter.timeUnit), step: this.getStep(filter.timeUnit) })));
    };
    RangeFilterShelfBase.prototype.filterModifyExtent = function (input) {
        // filterModifyExtent is only triggered by slider, so input must be number[].
        var range;
        if (this.props.renderDateTimePicker) {
            range = [filter_1.convertToDateTimeObject(input[0]), filter_1.convertToDateTimeObject(input[1])];
        }
        else {
            range = input;
        }
        if (range[0] > range[1]) {
            window.alert('Invalid bound');
            return;
        }
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        handleAction({
            type: actions_1.FILTER_MODIFY_EXTENT,
            payload: {
                index: index,
                range: range
            }
        });
    };
    RangeFilterShelfBase.prototype.filterModifyMaxBound = function (e) {
        var maxBound;
        if (e.hasOwnProperty('target')) {
            maxBound = Number(e.target.value);
        }
        else {
            maxBound = e;
        }
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        if (this.props.renderDateTimePicker) {
            maxBound = filter_1.convertToDateTimeObject(maxBound);
        }
        var minBound = this.props.filter.range[0];
        if (maxBound < minBound) {
            window.alert('Maximum bound cannot be smaller than minimum bound');
            return;
        }
        handleAction({
            type: actions_1.FILTER_MODIFY_MAX_BOUND,
            payload: {
                index: index,
                maxBound: maxBound
            }
        });
    };
    RangeFilterShelfBase.prototype.filterModifyMinBound = function (e) {
        var minBound;
        if (e.hasOwnProperty('target')) {
            minBound = Number(e.target.value);
        }
        else {
            minBound = e;
        }
        var _a = this.props, handleAction = _a.handleAction, index = _a.index, renderDateTimePicker = _a.renderDateTimePicker;
        if (renderDateTimePicker) {
            minBound = filter_1.convertToDateTimeObject(minBound);
        }
        var range = this.props.filter.range;
        var maxBound = range[1];
        if (minBound > maxBound) {
            window.alert('Minimum bound cannot be greater than maximum bound');
            return;
        }
        handleAction({
            type: actions_1.FILTER_MODIFY_MIN_BOUND,
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
                        React.createElement(DateTimePicker, { defaultValue: date, timeFormat: this.showTime(this.props.filter.timeUnit), open: false, onChange: onChangeAction, disableOnClickOutside: false })))));
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
    /**
     * returns whether to show the time component in the date time picker
     */
    RangeFilterShelfBase.prototype.showTime = function (timeUnit) {
        switch (timeUnit) {
            case undefined:
            case timeunit_1.TimeUnit.YEAR:
            case timeunit_1.TimeUnit.MONTH:
            case timeunit_1.TimeUnit.DAY:
            case timeunit_1.TimeUnit.DATE:
            case timeunit_1.TimeUnit.HOURS:
            case timeunit_1.TimeUnit.MINUTES:
            case timeunit_1.TimeUnit.SECONDS:
            case timeunit_1.TimeUnit.MILLISECONDS:
                return true;
            case timeunit_1.TimeUnit.YEARMONTHDATE:
                // hide time component as we do not care about it
                return false;
            default:
                throw new Error(timeUnit + ' is not supported');
        }
    };
    /**
     * Returns a function to format how the number is displayed in range filter for
     * the given time unit.
     */
    RangeFilterShelfBase.prototype.getFormat = function (renderDateTime, timeUnit) {
        if (!timeUnit) {
            if (renderDateTime) {
                // temporal filter without time unit
                // TODO: https://github.com/vega/voyager/issues/443: use the time formatter Vega derives from D3
                return function (value) {
                    return new Date(value).toString();
                };
            }
            else {
                // quantitative filter
                return;
            }
        }
        switch (timeUnit) {
            case timeunit_1.TimeUnit.YEAR:
            case timeunit_1.TimeUnit.MONTH:
            case timeunit_1.TimeUnit.DAY:
            case timeunit_1.TimeUnit.DATE:
            case timeunit_1.TimeUnit.HOURS:
            case timeunit_1.TimeUnit.MINUTES:
            case timeunit_1.TimeUnit.SECONDS:
            case timeunit_1.TimeUnit.MILLISECONDS:
                // do not need to format these time units.
                return;
            case timeunit_1.TimeUnit.YEARMONTHDATE:
                // TODO: https://github.com/vega/voyager/issues/443: use the time formatter Vega derives from D3
                return function (value) {
                    return new Date(value).toString();
                };
            default:
                throw new Error(timeUnit + ' is not supported');
        }
    };
    /**
     * Returns the range filter step for the given time unit.
     */
    RangeFilterShelfBase.prototype.getStep = function (timeUnit) {
        switch (timeUnit) {
            case undefined:
            case timeunit_1.TimeUnit.YEAR:
            case timeunit_1.TimeUnit.MONTH:
            case timeunit_1.TimeUnit.DAY:
            case timeunit_1.TimeUnit.DATE:
            case timeunit_1.TimeUnit.HOURS:
            case timeunit_1.TimeUnit.MINUTES:
            case timeunit_1.TimeUnit.SECONDS:
            case timeunit_1.TimeUnit.MILLISECONDS:
                return 1;
            case timeunit_1.TimeUnit.YEARMONTHDATE:
                return 24 * 60 * 60 * 1000; // step is one day in timestamp
            default:
                throw new Error(timeUnit + ' is not supported');
        }
    };
    return RangeFilterShelfBase;
}(React.PureComponent));
exports.RangeFilterShelfBase = RangeFilterShelfBase;
exports.RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
//# sourceMappingURL=range-filter-shelf.js.map