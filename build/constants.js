"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HISTORY_LIMIT = 20;
exports.PLOT_HOVER_MIN_DURATION = 500;
/**
 * Types of draggable items (for react-dnd).
 */
exports.DraggableType = {
    FIELD: 'field'
};
/**
 * Type of parent for Field Component
 */
var FieldParentType;
(function (FieldParentType) {
    FieldParentType[FieldParentType["ENCODING_SHELF"] = 0] = "ENCODING_SHELF";
    FieldParentType[FieldParentType["FIELD_LIST"] = 1] = "FIELD_LIST";
})(FieldParentType = exports.FieldParentType || (exports.FieldParentType = {}));
;
var BASE_DATA_DIR = (process.env.NODE_ENV === 'production') ? 'datasets/' : 'node_modules/vega-datasets/';
exports.SPINNER_COLOR = '#4C78A8';
exports.DEFAULT_DATASETS = [
    {
        name: 'Barley',
        description: 'Barley yield by variety across the upper midwest in 1931 and 1932',
        url: 'data/barley.json',
        id: 'barley',
        group: 'sample'
    }, {
        name: 'Cars',
        description: 'Automotive statistics for a variety of car models between 1970 & 1982',
        url: 'data/cars.json',
        id: 'cars',
        group: 'sample'
    }, {
        name: 'Crimea',
        url: 'data/crimea.json',
        id: 'crimea',
        group: 'sample'
    }, {
        name: 'Driving',
        url: 'data/driving.json',
        id: 'driving',
        group: 'sample'
    }, {
        name: 'Iris',
        url: 'data/iris.json',
        id: 'iris',
        group: 'sample'
    }, {
        name: 'Jobs',
        url: 'data/jobs.json',
        id: 'jobs',
        group: 'sample'
    }, {
        name: 'Population',
        url: 'data/population.json',
        id: 'population',
        group: 'sample'
    }, {
        name: 'Movies',
        url: 'data/movies.json',
        id: 'movies',
        group: 'sample'
    }, {
        name: 'Birdstrikes',
        url: 'data/birdstrikes.json',
        id: 'birdstrikes',
        group: 'sample'
    }, {
        name: 'Burtin',
        url: 'data/burtin.json',
        id: 'burtin',
        group: 'sample'
    }, {
        name: 'Campaigns',
        url: 'data/weball26.json',
        id: 'weball26',
        group: 'sample'
    }
].map(function (dataset) {
    return __assign({}, dataset, { url: BASE_DATA_DIR + dataset.url });
});
var SERVER = process.env.SERVER;
exports.VOYAGER_CONFIG = {
    showDataSourceSelector: true,
    serverUrl: SERVER
};
//# sourceMappingURL=constants.js.map