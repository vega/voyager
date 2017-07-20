"use strict";
// This module is intended to be used when embedding voyager
// in some other context than the orgiginal app.
//
// It provides factory methods for creating instances of the Voyager application
// and should eventually also export a react component if one is doing that kind
// of integration.
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var react_redux_1 = require("react-redux");
require("font-awesome-sass-loader"); // TODO should this move to App?
var util_1 = require("vega-lite/build/src/util");
var app_1 = require("./components/app");
var index_1 = require("./models/index");
var store_1 = require("./store");
/**
 * The Voyager class encapsulates the voyager application and allows for easy
 * instantiation and interaction from non-react projects.
 */
var Voyager = (function () {
    function Voyager(container, config, data) {
        if (util_1.isString(container)) {
            this.container = document.querySelector(container);
            // TODO throw error if not found
        }
        else {
            this.container = container;
        }
        this.init();
    }
    /**
     * Update the dataset currently loaded into voyager
     *
     * @param {VoyagerData} data
     *
     * @memberof Voyager
     */
    Voyager.prototype.updateData = function (data) {
        this.data = data;
        this.render(data, this.config);
    };
    /**
     * Update the configuration of the voyager application.
     *
     * @param {VoyagerConfig} config
     *
     * @memberof Voyager
     */
    Voyager.prototype.updateConfig = function (config) {
        this.config = config;
        this.render(this.data, config);
    };
    /**
     * Sets the entire voyager application state. This is useful for restoring
     * the state of the application to a previosly saved state.
     *
     * @param state A StateBase object with the following keys
     *
     * @param state.config
     * @param state.dataset
     * @param state.shelf
     * @param state.result
     *
     * @memberof Voyager
     */
    Voyager.prototype.setApplicationState = function (state) {
        this.data = undefined;
        this.config = undefined;
        this.renderFromState(index_1.fromSerializable(state));
    };
    /**
     *
     * Gets the current application state.
     *
     * @returns {Readonly<StateBase>}
     *
     * @memberof Voyager
     */
    Voyager.prototype.getApplicationState = function () {
        return index_1.toSerializable(this.store.getState().present);
    };
    /**
     * Subscribe to state changes.
     *
     * This is useful for taking state snapshots to persist and later restore.
     *
     * @param {Function} onChange callback that takes a single state parameter.
     * @returns {Function} unsubscribe, call this function to remove this listener.
     *
     * @memberof Voyager
     */
    Voyager.prototype.onStateChange = function (onChange) {
        var _this = this;
        var currentState;
        var handleChange = function () {
            var nextState = _this.store.getState();
            if (nextState !== currentState) {
                currentState = nextState;
                onChange(currentState.present);
            }
        };
        var unsubscribe = this.store.subscribe(handleChange);
        return unsubscribe;
    };
    /**
     * Initialized the application, and renders it into the target container
     *
     * @private
     *
     * @memberof Voyager
     */
    Voyager.prototype.init = function () {
        this.store = store_1.configureStore();
        this.render(this.data, this.config);
    };
    Voyager.prototype.render = function (data, config) {
        var store = this.store;
        var root = this.container;
        ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
            React.createElement(app_1.App, { dispatch: store.dispatch, data: data, config: config })), root);
    };
    Voyager.prototype.renderFromState = function (state) {
        var store = this.store;
        var root = this.container;
        ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
            React.createElement(app_1.App, { dispatch: store.dispatch, applicationState: state })), root);
    };
    return Voyager;
}());
/**
 * Create an instance of the voyager application.
 *
 * @param {Container} container css selector or HTMLElement that will be the parent
 *                              element of the application
 * @param {Object}    config    configuration options
 * @param {Array}     data      data object. Can be a string or an array of objects.
 */
function CreateVoyager(container, config, data) {
    return new Voyager(container, config, data);
}
exports.CreateVoyager = CreateVoyager;
