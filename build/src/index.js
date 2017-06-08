"use strict";
var React = require("react");
var ReactDOM = require("react-dom");
var react_redux_1 = require("react-redux");
require("font-awesome-sass-loader");
var app_1 = require("./components/app");
var store_1 = require("./store");
var store = store_1.configureStore();
var config = {
    showDataSourceSelector: true
};
var data = undefined;
ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
    React.createElement(app_1.App, { config: config, data: data, dispatch: store.dispatch })), document.getElementById('root'));
