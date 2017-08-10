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
var wildcard_1 = require("compassql/build/src/wildcard");
var React = require("react");
var CSSModules = require("react-css-modules");
var react_dnd_1 = require("react-dnd");
var filter_1 = require("vega-lite/build/src/filter");
var filter_2 = require("../../actions/filter");
var constants_1 = require("../../constants");
var styles = require("./filter-shelf.scss");
var one_of_filter_shelf_1 = require("./one-of-filter-shelf");
var range_filter_shelf_1 = require("./range-filter-shelf");
;
var FilterShelfBase = (function (_super) {
    __extends(FilterShelfBase, _super);
    function FilterShelfBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterShelfBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, filters = _a.filters, connectDropTarget = _a.connectDropTarget;
        var filterShelves = filters.map(function (filter, index) {
            return _this.renderFilterShelf(filter, index);
        });
        return connectDropTarget(React.createElement("div", null,
            filterShelves,
            this.fieldPlaceholder()));
    };
    FilterShelfBase.prototype.filterRemove = function (index) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: filter_2.FILTER_REMOVE,
            payload: {
                index: index
            }
        });
    };
    FilterShelfBase.prototype.renderFilterShelf = function (filter, index) {
        var _a = this.props, fieldDefs = _a.fieldDefs, schema = _a.schema;
        var fieldIndex = schema.fieldNames().indexOf(filter.field);
        var domain = schema.domain(fieldDefs[fieldIndex]);
        return (React.createElement("div", { styleName: 'filter-shelf', key: index },
            React.createElement("div", { styleName: 'header' },
                React.createElement("span", null, filter.field),
                React.createElement("a", { onClick: this.filterRemove.bind(this, index) },
                    React.createElement("i", { className: 'fa fa-times' }))),
            this.renderFilter(filter, index, domain)));
    };
    FilterShelfBase.prototype.renderFilter = function (filter, index, domain) {
        var handleAction = this.props.handleAction;
        if (filter_1.isRangeFilter(filter)) {
            return React.createElement(range_filter_shelf_1.RangeFilterShelf, { domain: domain, index: index, filter: filter, handleAction: handleAction });
        }
        else if (filter_1.isOneOfFilter(filter)) {
            return React.createElement(one_of_filter_shelf_1.OneOfFilterShelf, { domain: domain, index: index, filter: filter, handleAction: handleAction });
        }
    };
    FilterShelfBase.prototype.fieldPlaceholder = function () {
        var _a = this.props, item = _a.item, isOver = _a.isOver;
        return (React.createElement("span", { styleName: isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder' }, "Drop a field here"));
    };
    return FilterShelfBase;
}(React.Component));
var filterShelfTarget = {
    drop: function (props, monitor) {
        if (monitor.didDrop()) {
            return;
        }
        var filter = monitor.getItem().filter;
        if (wildcard_1.isWildcard(filter.field)) {
            throw new Error('Cannot add wildcard filter');
        }
        props.handleAction({
            type: filter_2.FILTER_ADD,
            payload: {
                filter: filter
            }
        });
    }
};
var collect = function (connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        item: monitor.getItem()
    };
};
// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
exports.FilterShelf = react_dnd_1.DropTarget(constants_1.DraggableType.FIELD, filterShelfTarget, collect)(CSSModules(FilterShelfBase, styles));
