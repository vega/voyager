// This module is intended to be used when embedding voyager
// in some other context than the orgiginal app.
//
// It provides factory methods for creating instances of the Voyager application
// and should eventually also export a react component if one is doing that kind
// of integration.
"use strict";
var React = require("react");
var ReactDOM = require("react-dom");
var react_redux_1 = require("react-redux");
require("font-awesome-sass-loader"); // TODO should this move to App?
var util_1 = require("vega-lite/build/src/util");
var app_1 = require("./components/app");
var store_1 = require("./store");
/**
 * The Voyager class encapsulates the voyager application and allows for easy
 * instantiation and interaction from non-react projects.
 */
var Voyager = (function () {
    function Voyager(container, config, data) {
        if (util_1.isString(container)) {
            this.container = document.querySelector(container);
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
