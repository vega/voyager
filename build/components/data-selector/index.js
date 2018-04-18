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
var CSSModules = require("react-css-modules");
var react_redux_1 = require("react-redux");
var react_modal_1 = require("react-modal");
// import {default as modal} from 'react-modal';
var react_tabs_1 = require("react-tabs");
var vega = require("vega");
var styles = require("./data-selector.scss");
var actions_1 = require("../../actions");
var constants_1 = require("../../constants");
var selectors_1 = require("../../selectors");
var DataSelectorBase = (function (_super) {
    __extends(DataSelectorBase, _super);
    function DataSelectorBase(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { modalIsOpen: false, dataText: '', dataName: '', dataUrl: '', fileType: undefined };
        _this.onDatasetChange = _this.onDatasetChange.bind(_this);
        _this.openModal = _this.openModal.bind(_this);
        _this.closeModal = _this.closeModal.bind(_this);
        _this.renderDataset = _this.renderDataset.bind(_this);
        _this.onFileChange = _this.onFileChange.bind(_this);
        _this.onDataTextSubmit = _this.onDataTextSubmit.bind(_this);
        _this.handleTextChange = _this.handleTextChange.bind(_this);
        _this.handleFileTypeChange = _this.handleFileTypeChange.bind(_this);
        _this.onDataUrlSubmit = _this.onDataUrlSubmit.bind(_this);
        return _this;
    }
    DataSelectorBase.prototype.render = function () {
        var title = this.props.title;
        return (React.createElement("span", { styleName: 'data-selector' },
            React.createElement("button", { onClick: this.openModal }, title),
            React.createElement(react_modal_1.default, { isOpen: this.state.modalIsOpen, onRequestClose: this.closeModal, contentLabel: "Data Selector", styleName: "modal", className: "voyager" },
                React.createElement("div", { className: 'modal-header' },
                    React.createElement("a", { styleName: 'modal-close', onClick: this.closeModal }, "close"),
                    React.createElement("h3", null, "Add Dataset")),
                React.createElement(react_tabs_1.Tabs, { className: styles['react-tabs'] },
                    React.createElement(react_tabs_1.TabList, { className: styles['tab-list'] },
                        React.createElement(react_tabs_1.Tab, { className: styles.tab }, "Change Dataset"),
                        React.createElement(react_tabs_1.Tab, { className: styles.tab }, "Paste or Upload Data"),
                        React.createElement(react_tabs_1.Tab, { className: styles.tab }, "From URL")),
                    React.createElement(react_tabs_1.TabPanel, { className: styles['tab-panel'] }, this.renderDatasetPanel()),
                    React.createElement(react_tabs_1.TabPanel, { className: styles['tab-panel'] },
                        React.createElement("div", null,
                            this.renderUploadPanel(),
                            this.renderPastePanel())),
                    React.createElement(react_tabs_1.TabPanel, { className: styles['tab-panel'] }, this.renderUrlPanel())))));
    };
    DataSelectorBase.prototype.renderDataset = function (dataset) {
        var selected = (dataset.name === this.props.data.name) ? styles['element-selected'] : null;
        return (React.createElement("li", { key: dataset.name, className: styles['dataset-list-element'] + " " + selected },
            React.createElement("a", { onClick: this.onDatasetChange.bind(this, dataset) },
                React.createElement("i", { className: "fa fa-database" }),
                " ",
                dataset.name)));
    };
    DataSelectorBase.prototype.renderDatasetPanel = function () {
        return (React.createElement("div", null,
            React.createElement("ul", { styleName: 'dataset-list' }, constants_1.DEFAULT_DATASETS.map(this.renderDataset))));
    };
    DataSelectorBase.prototype.renderUploadPanel = function () {
        return (React.createElement("div", { styleName: 'upload-panel' },
            React.createElement("div", { className: 'form-group' },
                React.createElement("label", { htmlFor: 'data-file' }, "File"),
                React.createElement("input", { id: 'data-file', type: 'file', onChange: this.onFileChange })),
            React.createElement("p", null, "Upload a data file, or paste data in CSV format into the input."),
            React.createElement("div", { styleName: 'dropzone-target' })));
    };
    DataSelectorBase.prototype.renderUrlPanel = function () {
        return (React.createElement("div", { styleName: 'url-panel' },
            React.createElement("p", null,
                "Add the name of the dataset and the URL to a ",
                React.createElement("b", null, " JSON "),
                ", ",
                React.createElement("b", null, " CSV "),
                " (with header), or",
                React.createElement("b", null, " TSV "),
                " file. Make sure that the formatting is correct and clean the data before adding it. The added dataset is only visible to you."),
            React.createElement("div", { className: 'form-group' },
                React.createElement("label", { htmlFor: 'filetype-selector' }, "File Type"),
                React.createElement("select", { value: this.state.fileType, onChange: this.handleFileTypeChange, id: 'filetype-selector' },
                    React.createElement("option", { value: "json" }, "JSON"),
                    React.createElement("option", { value: "csv" }, "CSV"),
                    React.createElement("option", { value: "tsv" }, "TSV"))),
            React.createElement("div", { className: 'form-group' },
                React.createElement("label", { htmlFor: 'data-name' }, "Name"),
                React.createElement("input", { name: 'dataName', value: this.state.dataName, onChange: this.handleTextChange, id: 'data-name', type: 'name' })),
            React.createElement("div", { className: 'form-group' },
                React.createElement("label", { htmlFor: 'data-url' }, "URL"),
                React.createElement("input", { name: 'dataUrl', value: this.state.dataUrl, onChange: this.handleTextChange, id: 'data-url', type: 'name' })),
            React.createElement("button", { onClick: this.onDataUrlSubmit }, "Add Dataset")));
    };
    DataSelectorBase.prototype.handleFileTypeChange = function (event) {
        this.setState({ fileType: event.target.value });
    };
    DataSelectorBase.prototype.renderPastePanel = function () {
        return (React.createElement("div", { styleName: 'paste-panel' },
            React.createElement("div", { className: 'form-group' },
                React.createElement("label", { htmlFor: 'data-name' }, "Name"),
                React.createElement("input", { name: 'dataName', value: this.state.dataName, onChange: this.handleTextChange, id: 'data-name', type: 'name' })),
            React.createElement("div", { className: 'form-group' },
                React.createElement("textarea", { name: 'dataText', value: this.state.dataText, onChange: this.handleTextChange })),
            React.createElement("button", { onClick: this.onDataTextSubmit }, "Add Data")));
    };
    DataSelectorBase.prototype.onDatasetChange = function (dataset) {
        this.props.handleAction(actions_1.datasetLoad(dataset.name, dataset));
        this.closeModal();
    };
    DataSelectorBase.prototype.onFileChange = function (event) {
        var handleAction = this.props.handleAction;
        var reader = new FileReader();
        var file = event.target.files[0];
        reader.onload = function (lEvent) {
            var name = file.name.replace(/\.\w+$/, '');
            var format = file.name.split('.').pop();
            var values;
            try {
                values = vega.read(lEvent.target.result, { type: format });
            }
            catch (err) {
                window.alert(err.message);
            }
            handleAction(actions_1.datasetLoad(name, { values: values, format: format }));
        };
        reader.readAsText(file);
    };
    DataSelectorBase.prototype.onDataTextSubmit = function () {
        var values = vega.read(this.state.dataText, { type: 'csv' });
        this.props.handleAction(actions_1.datasetLoad(this.state.dataName, { values: values }));
    };
    DataSelectorBase.prototype.loadDataString = function (data) {
        var name = this.state.dataName;
        var fileType = this.state.fileType;
        var values = vega.read(data, { type: fileType });
        this.props.handleAction(actions_1.datasetLoad(name, { values: values }));
    };
    DataSelectorBase.prototype.onDataUrlSubmit = function () {
        var _this = this;
        var loader = vega.loader();
        loader.load(this.state.dataUrl).then(function (data) {
            _this.loadDataString(data);
        }).catch(function (error) {
            console.warn('Error occurred while loading data: ', error);
        });
    };
    DataSelectorBase.prototype.openModal = function () {
        this.setState({ modalIsOpen: true });
    };
    DataSelectorBase.prototype.closeModal = function () {
        this.setState({ modalIsOpen: false });
    };
    // https://facebook.github.io/react/docs/forms.html
    DataSelectorBase.prototype.handleTextChange = function (event) {
        var name = event.target.name;
        this.setState((_a = {}, _a[name] = event.target.value, _a));
        var _a;
    };
    return DataSelectorBase;
}(React.PureComponent));
exports.DataSelectorBase = DataSelectorBase;
var DataSelectorRenderer = CSSModules(DataSelectorBase, styles);
exports.DataSelector = react_redux_1.connect(function (state) {
    return {
        data: selectors_1.selectDataset(state)
    };
}, actions_1.createDispatchHandler())(DataSelectorRenderer);
//# sourceMappingURL=index.js.map