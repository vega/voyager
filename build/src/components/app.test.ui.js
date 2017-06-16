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
                    var header = wrapper.find('header');
                    expect(header.exists());
                    expect(header.text()).toContain('Voyager 2');
                }
                catch (err) {
                    done.fail(err);
                }
                done();
            }, 10);
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
                        var fieldList = wrapper_1.find('.field-list__field-list-item');
                        var fields = fieldList.children().map(function (d) { return d.text(); });
                        expect(fields).toContain('fieldA');
                        expect(fields).toContain('fieldB');
                        done();
                    }, 100);
                }
                catch (err) {
                    done.fail(err);
                }
            }, 10);
        });
    });
});
