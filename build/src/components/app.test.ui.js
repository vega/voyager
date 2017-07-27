"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment jsdom
 */
var enzyme_1 = require("enzyme");
var React = require("react");
var react_redux_1 = require("react-redux");
var store_1 = require("../store");
var app_1 = require("./app");
var DEFAULT_TIMEOUT_LENGTH = 300;
describe('Voyager', function () {
    describe('instantiation via component', function () {
        it('renders voyager', function (done) {
            var config = {};
            var data = undefined;
            var store = store_1.configureStore();
            setTimeout(function () {
                try {
                    var wrapper = enzyme_1.mount(React.createElement(react_redux_1.Provider, { store: store },
                        React.createElement(app_1.App, { config: config, data: data, dispatch: store.dispatch })));
                    var dataPaneHeader = wrapper.find('.data-pane__data-pane h2');
                    expect(dataPaneHeader.exists());
                    expect(dataPaneHeader.text()).toContain('Data');
                }
                catch (err) {
                    done.fail(err);
                }
                done();
            }, DEFAULT_TIMEOUT_LENGTH);
        });
        it('renders voyager with custom data', function (done) {
            var config = {};
            var data = {
                "values": [
                    { "fieldA": "A", "fieldB": 28 }, { "fieldA": "B", "fieldB": 55 }, { "fieldA": "C", "fieldB": 43 },
                    { "fieldA": "D", "fieldB": 91 }, { "fieldA": "E", "fieldB": 81 }, { "fieldA": "F", "fieldB": 53 },
                    { "fieldA": "G", "fieldB": 19 }, { "fieldA": "H", "fieldB": 87 }, { "fieldA": "I", "fieldB": 52 }
                ]
            };
            var store = store_1.configureStore();
            setTimeout(function () {
                try {
                    var wrapper_1 = enzyme_1.mount(React.createElement(react_redux_1.Provider, { store: store },
                        React.createElement(app_1.App, { config: config, data: data, dispatch: store.dispatch })));
                    setTimeout(function () {
                        try {
                            var fieldList = wrapper_1.find('.field-list__field-list-item');
                            var fields = fieldList.children().map(function (d) { return d.text(); });
                            expect(fields).toContain(' fieldA');
                            expect(fields).toContain(' fieldB');
                            done();
                        }
                        catch (err) {
                            done.fail(err);
                        }
                    }, DEFAULT_TIMEOUT_LENGTH);
                }
                catch (err) {
                    done.fail(err);
                }
            }, DEFAULT_TIMEOUT_LENGTH);
        });
    });
    describe('vega-lite spec', function () {
        it.skip('accepts valid spec', function (done) {
            var config = {};
            var data = undefined;
            var store = store_1.configureStore();
            var values = [
                { date: "24-Apr-07", close: "93.24" },
                { date: "25-Apr-07", close: "95.35" },
                { date: "26-Apr-07", close: "98.84" },
                { date: "27-Apr-07", close: "99.92" },
            ];
            var spec = {
                "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                "data": {
                    values: values
                },
                "mark": "bar",
                "encoding": {
                    "x": {
                        "bin": { "maxbins": 10 },
                        "field": "close",
                        "type": "quantitative"
                    },
                    "y": {
                        "aggregate": "count",
                        "type": "quantitative"
                    }
                }
            };
            setTimeout(function () {
                try {
                    var wrapper_2 = enzyme_1.mount(React.createElement(react_redux_1.Provider, { store: store },
                        React.createElement(app_1.App, { config: config, data: data, dispatch: store.dispatch, spec: spec })));
                    setTimeout(function () {
                        try {
                            var fieldList = wrapper_2.find('.encoding-shelf__encoding-shelf');
                            var fields = fieldList.map(function (d) { return d.text(); });
                            expect(fields).toContain('x close');
                            done();
                        }
                        catch (err) {
                            done.fail(err);
                        }
                    }, DEFAULT_TIMEOUT_LENGTH);
                }
                catch (err) {
                    done.fail(err);
                }
            }, DEFAULT_TIMEOUT_LENGTH);
        });
        it('error on invalid spec', function (done) {
            var config = {};
            var data = undefined;
            var store = store_1.configureStore();
            var spec = {
                "FAIL$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                "FAILdata": { "url": "node_modules/vega-datasets/data/movies.json" },
                "FAILmark": "bar",
                "encoding": {}
            };
            // This should throw an exception;
            setTimeout(function () {
                try {
                    enzyme_1.mount(React.createElement(react_redux_1.Provider, { store: store },
                        React.createElement(app_1.App, { config: config, data: data, dispatch: store.dispatch, spec: spec })));
                    done.fail('No exception thrown with invalid spec');
                }
                catch (err) {
                    expect(true);
                    done();
                }
            }, DEFAULT_TIMEOUT_LENGTH);
        });
    });
});
