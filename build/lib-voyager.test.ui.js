"use strict";
/**
 * @jest-environment jsdom
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ReactDOM = require("react-dom");
var lib_voyager_1 = require("./lib-voyager");
var DEFAULT_TIMEOUT_LENGTH = 300;
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
    describe('CreateVoyager, updateData', function () {
        it('initializes with empty data and can be updated with customized data', function (done) {
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
                    var dataPaneHeader = document.querySelector('.load-data-pane__load-data-pane');
                    expect(dataPaneHeader.textContent).toContain('Please load a dataset');
                    setTimeout(function () {
                        try {
                            var fieldList = document.querySelectorAll('.field-list__field-list-item');
                            expect(fieldList.length).toEqual(0);
                            voyagerInst_1.updateData(data);
                        }
                        catch (err) {
                            done.fail(err);
                        }
                        setTimeout(function () {
                            try {
                                var fieldList = document.querySelectorAll('.field-list__field-list-item');
                                var fields = Array.prototype.map.call(fieldList, function (d) { return d.textContent; });
                                expect(fields).toContain(' fieldA');
                                expect(fields).toContain(' fieldB');
                                done();
                            }
                            catch (err) {
                                done.fail(err);
                            }
                        }, DEFAULT_TIMEOUT_LENGTH);
                    }, DEFAULT_TIMEOUT_LENGTH);
                }
                catch (err) {
                    done.fail(err);
                }
            }, 10);
        });
    });
    describe('get/setApplicationState', function () {
        it('gets and sets application state', function (done) {
            setTimeout(function () {
                try {
                    var voyagerInst_2 = lib_voyager_1.CreateVoyager(container, undefined, undefined);
                    var state = voyagerInst_2.getApplicationState();
                    expect(state).toHaveProperty('config');
                    expect(state).toHaveProperty('dataset');
                    expect(state).toHaveProperty('result');
                    expect(state).toHaveProperty('shelf');
                    var originalConfigOption_1 = state.config.showDataSourceSelector;
                    state.config.showDataSourceSelector = !state.config.showDataSourceSelector;
                    voyagerInst_2.setApplicationState(state);
                    setTimeout(function () {
                        try {
                            var newState = voyagerInst_2.getApplicationState();
                            expect(newState).toHaveProperty('config');
                            expect(newState).toHaveProperty('dataset');
                            expect(newState).toHaveProperty('result');
                            expect(newState).toHaveProperty('shelf');
                            expect(newState.config.showDataSourceSelector).toEqual(!originalConfigOption_1);
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
        it('subscribes to state changes', function (done) {
            setTimeout(function () {
                try {
                    var voyagerInst_3 = lib_voyager_1.CreateVoyager(container, undefined, undefined);
                    var aState_1 = voyagerInst_3.getApplicationState();
                    var originalConfigOption_2 = aState_1.config.showDataSourceSelector;
                    aState_1.config.showDataSourceSelector = !aState_1.config.showDataSourceSelector;
                    var handleStateChange = function (state) {
                        expect(state.config).toBeDefined();
                        expect(state.dataset).toBeDefined();
                        expect(state.result).toBeDefined();
                        expect(state.shelf).toBeDefined();
                        expect(state.config.showDataSourceSelector).toEqual(!originalConfigOption_2);
                        done();
                    };
                    voyagerInst_3.onStateChange(handleStateChange);
                    setTimeout(function () {
                        voyagerInst_3.setApplicationState(aState_1);
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
            setTimeout(function () {
                try {
                    var voyagerInst = lib_voyager_1.CreateVoyager(container, undefined, undefined);
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
                    voyagerInst.setSpec(spec);
                    setTimeout(function () {
                        try {
                            var shelves = document.querySelectorAll('.encoding-shelf__encoding-shelf');
                            var shelfText = Array.prototype.map.call(shelves, function (d) { return d.textContent; });
                            expect(shelfText).toContain('x   binclose');
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
            var spec = {
                "FAIL$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                "FAILdata": { "url": "node_modules/vega-datasets/data/movies.json" },
                "FAILmark": "bar",
                "encoding": {}
            };
            var voyagerInst = lib_voyager_1.CreateVoyager(container, config, data);
            // This should throw an exception;
            setTimeout(function () {
                try {
                    voyagerInst.setSpec(spec);
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
//# sourceMappingURL=lib-voyager.test.ui.js.map