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
                    var dataPaneHeader = wrapper.find('.load-data-pane__load-data-pane');
                    expect(dataPaneHeader.exists());
                    expect(dataPaneHeader.text()).toContain('Please load a dataset');
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
        it('accepts valid spec', function (done) {
            var config = {};
            var store = store_1.configureStore();
            var values = [
                { date: "24-Apr-07", close: "93.24" },
                { date: "25-Apr-07", close: "95.35" },
                { date: "26-Apr-07", close: "98.84" },
                { date: "27-Apr-07", close: "99.92" },
            ];
            var data = { values: values };
            var spec = {
                "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                "data": {
                    "values": [
                        { "date": "24-Apr-07", "close": "93.24" },
                        { "date": "25-Apr-07", "close": "95.35" },
                        { "date": "26-Apr-07", "close": "98.84" },
                        { "date": "27-Apr-07", "close": "99.92" }
                    ]
                },
                "mark": "bar",
                "encoding": {
                    "x": {
                        "bin": true,
                        "field": "close",
                        "type": "quantitative"
                    },
                    "y": {
                        "aggregate": "count",
                        "field": "*",
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
                            expect(fields).toContain('x   binclose');
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
});
//# sourceMappingURL=app.test.ui.js.map