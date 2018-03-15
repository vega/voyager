"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var react_redux_1 = require("react-redux");
require("font-awesome-sass-loader");
var app_1 = require("./components/app");
var constants_1 = require("./constants");
var store_1 = require("./store");
var store = store_1.configureStore();
var config = constants_1.VOYAGER_CONFIG;
var data = undefined;
ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
    React.createElement(app_1.App, { config: config, data: data, dispatch: store.dispatch })), document.getElementById('root'));
// Hot Module Replacement API
if (module.hot) {
    module.hot.accept('./components/app', function () {
        var NextApp = require('./components/app').App;
        ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
            React.createElement(NextApp, { config: config, data: data, dispatch: store.dispatch })), document.getElementById('root'));
    });
}
//# sourceMappingURL=index.js.map