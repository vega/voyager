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
var redux_undo_1 = require("redux-undo");
var actions_1 = require("../actions");
var shelf_1 = require("../actions/shelf");
var app_root_1 = require("./app-root");
var App = (function (_super) {
    __extends(App, _super);
    function App(props) {
        return _super.call(this, props) || this;
    }
    App.prototype.componentWillUpdate = function (nextProps) {
        this.update(nextProps);
    };
    App.prototype.componentWillMount = function () {
        // Clear history as redux-undo seems to always put the first action after
        // an init into the history. This ensures we start with a fresh history once
        // the app is about to start.
        this.props.dispatch(redux_undo_1.ActionCreators.clearHistory());
        this.update(this.props);
    };
    App.prototype.render = function () {
        return React.createElement(app_root_1.AppRoot, null);
    };
    App.prototype.update = function (nextProps) {
        var data = nextProps.data, config = nextProps.config, applicationState = nextProps.applicationState, dispatch = nextProps.dispatch, spec = nextProps.spec, filename = nextProps.filename;
        if (data) {
            this.setData(data, filename);
        }
        if (config) {
            this.setConfig(config);
        }
        if (spec) {
            // Note that this will overwrite other passed in props
            this.setSpec(spec, filename);
        }
        if (applicationState) {
            // Note that this will overwrite other passed in props
            this.setApplicationState(applicationState);
        }
    };
    App.prototype.setData = function (data, filename) {
        return this.props.dispatch(actions_1.datasetLoad(filename, data));
    };
    App.prototype.setConfig = function (config) {
        this.props.dispatch({
            type: actions_1.SET_CONFIG,
            payload: {
                config: config,
            }
        });
    };
    App.prototype.setSpec = function (spec, filename) {
        var _this = this;
        if (spec.data) {
            this.setData(spec.data, filename)
                .then(function () {
                _this.shelfSpecLoad(spec);
            }, function (err) {
                throw new Error('error setting data for spec:' + err.toString());
            });
        }
        else {
            this.shelfSpecLoad(spec);
        }
    };
    App.prototype.shelfSpecLoad = function (spec) {
        this.props.dispatch({
            type: shelf_1.SPEC_LOAD,
            payload: {
                spec: spec,
                keepWildcardMark: false
            }
        });
    };
    App.prototype.setApplicationState = function (state) {
        this.props.dispatch({
            type: actions_1.SET_APPLICATION_STATE,
            payload: {
                state: state,
            }
        });
    };
    return App;
}(React.PureComponent));
exports.App = App;
//# sourceMappingURL=app.js.map