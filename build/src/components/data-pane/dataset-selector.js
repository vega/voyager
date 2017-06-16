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
var actions_1 = require("../../actions");
var constants_1 = require("../../constants");
var DATASET_INDEX = constants_1.DEFAULT_DATASETS.reduce(function (index, dataset) {
    index[dataset.name] = dataset;
    return index;
}, {});
var options = constants_1.DEFAULT_DATASETS.map(function (dataset) { return (React.createElement("option", { key: dataset.name, value: dataset.name }, dataset.name)); });
/**
 * Control for selecting mark type
 */
var DatasetSelector = (function (_super) {
    __extends(DatasetSelector, _super);
    function DatasetSelector(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onDatasetChange = _this.onDatasetChange.bind(_this);
        return _this;
    }
    DatasetSelector.prototype.componentDidUpdate = function () {
        this.props.handleAction(actions_1.resultRequest());
    };
    DatasetSelector.prototype.render = function () {
        return (React.createElement("select", { className: "DEFAULT_DATASETSelector", value: this.props.name, onChange: this.onDatasetChange }, options));
    };
    DatasetSelector.prototype.onDatasetChange = function (event) {
        var name = event.target.value;
        var url = DATASET_INDEX[name].url;
        this.props.handleAction(actions_1.datasetLoad(name, { url: url }));
    };
    return DatasetSelector;
}(React.PureComponent));
exports.DatasetSelector = DatasetSelector;
