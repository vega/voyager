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
require("./app.scss");
var Ajv = require("ajv");
var draft4Schemas = require("ajv/lib/refs/json-schema-draft-04.json");
var spec_1 = require("compassql/build/src/query/spec");
var spec_2 = require("vega-lite/build/src/spec");
var vlSchema = require("vega-lite/build/vega-lite-schema.json");
var React = require("react");
var react_dnd_1 = require("react-dnd");
var react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
var SplitPane = require("react-split-pane");
var redux_undo_1 = require("redux-undo");
var actions_1 = require("../actions");
var shelf_1 = require("../actions/shelf");
var spec_3 = require("../models/shelf/spec");
var data_pane_1 = require("./data-pane");
var encoding_pane_1 = require("./encoding-pane");
var header_1 = require("./header");
var view_pane_1 = require("./view-pane");
var AppBase = (function (_super) {
    __extends(AppBase, _super);
    function AppBase(props) {
        return _super.call(this, props) || this;
    }
    AppBase.prototype.componentWillUpdate = function (nextProps) {
        this.update(nextProps);
    };
    AppBase.prototype.componentWillMount = function () {
        // Clear history as redux-undo seems to always put the first action after
        // an init into the history. This ensures we start with a fresh history once
        // the app is about to start.
        this.props.dispatch(redux_undo_1.ActionCreators.clearHistory());
        this.update(this.props);
    };
    AppBase.prototype.render = function () {
        return (React.createElement("div", { className: "voyager" },
            React.createElement(header_1.Header, null),
            React.createElement(SplitPane, { split: "vertical", defaultSize: 200 },
                React.createElement(data_pane_1.DataPane, null),
                React.createElement(SplitPane, { split: "vertical", defaultSize: 235 },
                    React.createElement(encoding_pane_1.EncodingPane, null),
                    React.createElement(view_pane_1.ViewPane, null)))));
    };
    AppBase.prototype.update = function (nextProps) {
        var data = nextProps.data, config = nextProps.config, applicationState = nextProps.applicationState, dispatch = nextProps.dispatch, spec = nextProps.spec;
        if (data) {
            this.setData(data);
        }
        if (config) {
            this.setConfig(config);
        }
        if (spec) {
            // Note that this will overwrite other passed in props
            this.setSpec(spec);
        }
        if (applicationState) {
            // Note that this will overwrite other passed in props
            this.setApplicationState(applicationState);
        }
    };
    AppBase.prototype.setData = function (data) {
        return this.props.dispatch(actions_1.datasetLoad("Custom Data", data));
    };
    AppBase.prototype.setConfig = function (config) {
        this.props.dispatch({
            type: actions_1.SET_CONFIG,
            payload: {
                config: config,
            }
        });
    };
    AppBase.prototype.setSpec = function (spec) {
        var _this = this;
        var ajv = new Ajv({
            validateSchema: true,
            allErrors: true,
            extendRefs: 'fail'
        });
        ajv.addMetaSchema(draft4Schemas, 'http://json-schema.org/draft-04/schema#');
        var validateVl = ajv.compile(vlSchema);
        var valid = validateVl(spec);
        if (!valid) {
            throw new Error("Invalid spec:" + validateVl.errors.toString());
        }
        var validSpec = spec;
        if (!spec_2.isUnitSpec(validSpec)) {
            throw new Error("Voyager does not support layered or multi-view vega-lite specs");
        }
        if (validSpec.data) {
            this.setData(validSpec.data)
                .then(function () {
                var specQuery = spec_1.fromSpec(validSpec);
                var shelfSpec = spec_3.fromSpecQuery(specQuery);
                _this.props.dispatch({
                    type: shelf_1.SHELF_SPEC_LOAD,
                    payload: {
                        spec: shelfSpec,
                    },
                });
            }, function (err) {
                throw new Error('error setting data for spec:' + err.toString());
            });
        }
        else {
            var specQuery = spec_1.fromSpec(validSpec);
            var shelfSpec = spec_3.fromSpecQuery(specQuery);
            this.props.dispatch({
                type: shelf_1.SHELF_SPEC_LOAD,
                payload: {
                    spec: shelfSpec,
                },
            });
        }
    };
    AppBase.prototype.setApplicationState = function (state) {
        this.props.dispatch({
            type: actions_1.SET_APPLICATION_STATE,
            payload: {
                state: state,
            }
        });
    };
    return AppBase;
}(React.PureComponent));
exports.App = react_dnd_1.DragDropContext(react_dnd_html5_backend_1.default)(AppBase);
