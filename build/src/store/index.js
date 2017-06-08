"use strict";
var redux_1 = require("redux");
var redux_logger_1 = require("redux-logger");
var redux_thunk_1 = require("redux-thunk");
var models_1 = require("../models");
var reducers_1 = require("../reducers");
var loggerMiddleware = redux_logger_1.createLogger({
    collapsed: true,
    level: 'debug'
});
// define which middleware to use depending on environment
var composeEnhancers = redux_1.compose;
var middleware = [redux_thunk_1.default];
// when not in production enable redux tools and add logger middleware
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    composeEnhancers =
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux_1.compose;
    middleware.push(loggerMiddleware);
}
function configureStore(initialState) {
    if (initialState === void 0) { initialState = models_1.DEFAULT_STATE; }
    var store = redux_1.createStore(reducers_1.rootReducer, { past: [], present: initialState, future: [] }, composeEnhancers(redux_1.applyMiddleware.apply(void 0, middleware)));
    return store;
}
exports.configureStore = configureStore;
