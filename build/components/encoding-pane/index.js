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
var react_redux_1 = require("react-redux");
var redux_action_1 = require("../../actions/redux-action");
var shelf_1 = require("../../actions/shelf");
var selectors_1 = require("../../selectors");
var index_1 = require("../../selectors/index");
var shelf_2 = require("../../selectors/shelf");
var filter_pane_1 = require("../filter-pane");
var styles = require("./encoding-pane.scss");
var encoding_shelf_1 = require("./encoding-shelf");
var mark_picker_1 = require("./mark-picker");
var EncodingPanelBase = (function (_super) {
    __extends(EncodingPanelBase, _super);
    function EncodingPanelBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onClear = _this.onClear.bind(_this);
        return _this;
    }
    EncodingPanelBase.prototype.render = function () {
        var _a = this.props, specPreview = _a.specPreview, spec = _a.spec;
        var wildcards = this.props.config.wildcards;
        var anyEncodings = (specPreview || spec).anyEncodings;
        var positionShelves = ['x', 'y'].map(this.encodingShelf, this);
        var facetShelves = ['row', 'column'].map(this.encodingShelf, this);
        var nonPositionShelves = ['size', 'color', 'shape', 'detail', 'text'].map(this.encodingShelf, this);
        var wildcardShelvesGroup = wildcards !== 'disabled' && (React.createElement("div", { styleName: "shelf-group" },
            React.createElement("h3", null, "Wildcard Shelves"),
            anyEncodings.map(function (_, i) { return i; }).concat([-1 // map the empty placeholder to -1
            ]).map(this.wildcardShelf, this)));
        return (React.createElement("div", { className: "pane", styleName: "encoding-pane" },
            React.createElement("a", { className: "right", onClick: this.onClear },
                React.createElement("i", { className: "fa fa-eraser" }),
                ' ',
                "Clear"),
            React.createElement("h2", null,
                "Encoding",
                specPreview && ' Preview'),
            React.createElement("div", { styleName: "shelf-group" }, positionShelves),
            React.createElement("div", { styleName: "shelf-group" },
                React.createElement("div", { className: "right" }, this.markPicker()),
                React.createElement("h3", null, "Mark"),
                nonPositionShelves),
            React.createElement("div", { styleName: "shelf-group" },
                React.createElement("h3", null, "Facet"),
                facetShelves),
            wildcardShelvesGroup,
            React.createElement("div", { styleName: "shelf-group" },
                React.createElement("h3", null, "Filter"),
                this.filterPane())));
    };
    /**
     * Return encoding shelf for normal (non-wildcard channels).
     */
    EncodingPanelBase.prototype.encodingShelf = function (channel) {
        // This one can't be wildcard, thus we use VL's Channel, not our ShelfChannel
        var _a = this.props, handleAction = _a.handleAction, spec = _a.spec, specPreview = _a.specPreview, schema = _a.schema;
        var encoding = (specPreview || spec).encoding;
        return (React.createElement(encoding_shelf_1.EncodingShelf, { key: channel, id: { channel: channel }, fieldDef: encoding[channel], schema: schema, handleAction: handleAction }));
    };
    EncodingPanelBase.prototype.markPicker = function () {
        var _a = this.props, handleAction = _a.handleAction, spec = _a.spec, specPreview = _a.specPreview;
        var mark = (specPreview || spec).mark;
        return React.createElement(mark_picker_1.MarkPicker, { mark: mark, handleAction: handleAction });
    };
    EncodingPanelBase.prototype.wildcardShelf = function (index) {
        var _a = this.props, handleAction = _a.handleAction, spec = _a.spec, specPreview = _a.specPreview, schema = _a.schema;
        var anyEncodings = (specPreview || spec).anyEncodings;
        var id = {
            channel: wildcard_1.SHORT_WILDCARD,
            index: index
        };
        return (React.createElement(encoding_shelf_1.EncodingShelf, { key: index, id: id, schema: schema, fieldDef: anyEncodings[index], handleAction: handleAction }));
    };
    EncodingPanelBase.prototype.filterPane = function () {
        var _a = this.props, filters = _a.filters, schema = _a.schema, handleAction = _a.handleAction;
        return (React.createElement(filter_pane_1.FilterPane, { filters: filters, schema: schema, handleAction: handleAction }));
    };
    EncodingPanelBase.prototype.onClear = function () {
        this.props.handleAction({ type: shelf_1.SPEC_CLEAR });
    };
    return EncodingPanelBase;
}(React.PureComponent));
exports.EncodingPane = react_redux_1.connect(function (state) {
    var presentUndoableState = state.undoable.present;
    return {
        spec: shelf_2.selectShelfSpec(state),
        filters: shelf_2.selectFilters(state),
        schema: selectors_1.selectDataset(state).schema,
        fieldDefs: index_1.selectSchemaFieldDefs(state),
        specPreview: selectors_1.selectShelfPreview(state).spec,
        config: selectors_1.selectConfig(state)
    };
}, redux_action_1.createDispatchHandler())(CSSModules(EncodingPanelBase, styles));
//# sourceMappingURL=index.js.map