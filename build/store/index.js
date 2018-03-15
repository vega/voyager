"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:enable:no-unused-variable
var redux_1 = require("redux");
var redux_action_log_1 = require("redux-action-log");
var redux_logger_1 = require("redux-logger");
var redux_thunk_1 = require("redux-thunk");
var models_1 = require("../models");
var reducers_1 = require("../reducers");
var listener_1 = require("./listener");
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
    exports.actionLogs = redux_action_log_1.createActionLog({ limit: null });
    var store = redux_1.createStore(reducers_1.rootReducer, initialState, composeEnhancers(redux_1.applyMiddleware.apply(void 0, middleware), exports.actionLogs.enhancer)
    // HACK: cast to any to supress typescript complaint
    );
    if (module.hot) {
        // Enable webpack hot module replacement for reducers
        module.hot.accept('../reducers', function () {
            var nextRootReducer = require('../reducers').rootReducer;
            store.replaceReducer(nextRootReducer);
        });
    }
    store.subscribe(listener_1.createQueryListener(store));
    return store;
}
exports.configureStore = configureStore;
//# sourceMappingURL=index.js.map