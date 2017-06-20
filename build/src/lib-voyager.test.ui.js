"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment jsdom
 */
var enzyme_1 = require("enzyme");
var React = require("react");
var ReactDOM = require("react-dom");
var react_redux_1 = require("react-redux");
var app_1 = require("./components/app");
var lib_voyager_1 = require("./lib-voyager");
var store_1 = require("./store");
describe('lib-voyager', function () {
    var container;
    beforeEach(function () {
        document.body.innerHTML = "<div id=\"root\"></div>";
        container = document.getElementById('root');
    });
    afterEach(function (done) {
        ReactDOM.unmountComponentAtNode(container);
        document.body.innerHTML = "";
        setTimeout(done);
    });
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
    });
    describe('instantiation', function () {
        it('renders voyager on instantiation with DOM Node', function (done) {
            var config = {};
            var data = undefined;
            setTimeout(function () {
                try {
                    lib_voyager_1.CreateVoyager(container, config, data);
                    var header = document.querySelector('header');
                    expect(header.textContent).toContain('Voyager 2');
                    done();
                }
                catch (err) {
                    done.fail(err);
                }
            }, 10);
        });
    });
    describe('data', function () {
        it('initialize with custom data', function (done) {
            var data = {
                "values": [
                    { "fieldA": "A", "fieldB": 28 }, { "fieldA": "B", "fieldB": 55 }, { "fieldA": "C", "fieldB": 43 },
                    { "fieldA": "D", "fieldB": 91 }, { "fieldA": "E", "fieldB": 81 }, { "fieldA": "F", "fieldB": 53 },
                    { "fieldA": "G", "fieldB": 19 }, { "fieldA": "H", "fieldB": 87 }, { "fieldA": "I", "fieldB": 52 }
                ]
            };
            setTimeout(function () {
                try {
                    var voyagerInst_1 = lib_voyager_1.CreateVoyager(container, undefined, undefined);
                    var header = document.querySelector('header');
                    expect(header.textContent).toContain('Voyager 2');
                    setTimeout(function () {
                        var fieldList = document.querySelectorAll('.field-list__field-list-item');
                        var fields = Array.prototype.map.call(fieldList, function (d) { return d.textContent; });
                        expect(fields).toContain('q1');
                        expect(fields).toContain('q2');
                        voyagerInst_1.updateData(data);
                        setTimeout(function () {
                            fieldList = document.querySelectorAll('.field-list__field-list-item');
                            fields = Array.prototype.map.call(fieldList, function (d) { return d.textContent; });
                            expect(fields).toContain('fieldA');
                            expect(fields).toContain('fieldB');
                            expect(fields).not.toContain('q1');
                            expect(fields).not.toContain('q2');
                            done();
                        }, 200);
                    }, 200);
                }
                catch (err) {
                    done.fail(err);
                }
            }, 10);
        });
    });
    describe('applicationState', function () {
        it('gets initial application state', function (done) {
            setTimeout(function () {
                try {
                    var voyagerInst = lib_voyager_1.CreateVoyager(container, undefined, undefined);
                    var state = voyagerInst.getApplicationState();
                    expect(state).toHaveProperty('config');
                    expect(state).toHaveProperty('dataset');
                    expect(state).toHaveProperty('result');
                    expect(state).toHaveProperty('shelf');
                    done();
                }
                catch (err) {
                    done.fail(err);
                }
            }, 10);
        });
        it('sets application state', function (done) {
            setTimeout(function () {
                try {
                    var voyagerInst_2 = lib_voyager_1.CreateVoyager(container, undefined, undefined);
                    var state = voyagerInst_2.getApplicationState();
                    expect(state).toHaveProperty('config');
                    var originalConfigOption_1 = state.config.showDataSourceSelector;
                    state.config.showDataSourceSelector = !state.config.showDataSourceSelector;
                    voyagerInst_2.setApplicationState(state);
                    setTimeout(function () {
                        var newState = voyagerInst_2.getApplicationState();
                        expect(newState).toHaveProperty('config');
                        expect(newState).toHaveProperty('dataset');
                        expect(newState).toHaveProperty('result');
                        expect(newState).toHaveProperty('shelf');
                        expect(newState.config.showDataSourceSelector).toEqual(!originalConfigOption_1);
                        done();
                    }, 100);
                }
                catch (err) {
                    done.fail(err);
                }
            }, 10);
        });
        it('subscribes to state changes', function (done) {
            setTimeout(function () {
                try {
                    var voyagerInst_3 = lib_voyager_1.CreateVoyager(container, undefined, undefined);
                    var aState_1 = voyagerInst_3.getApplicationState();
                    var originalConfigOption_2 = aState_1.config.showDataSourceSelector;
                    aState_1.config.showDataSourceSelector = !aState_1.config.showDataSourceSelector;
                    var handleStateChange = function (state) {
                        expect(state).toHaveProperty('config');
                        expect(state).toHaveProperty('dataset');
                        expect(state).toHaveProperty('result');
                        expect(state).toHaveProperty('shelf');
                        expect(state.config.showDataSourceSelector).toEqual(!originalConfigOption_2);
                        done();
                    };
                    voyagerInst_3.onStateChange(handleStateChange);
                    setTimeout(function () {
                        voyagerInst_3.setApplicationState(aState_1);
                    }, 50);
                }
                catch (err) {
                    done.fail(err);
                }
            }, 10);
        });
    });
});
