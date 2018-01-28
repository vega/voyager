/**
 * @jest-environment jsdom
 */

import * as ReactDOM from 'react-dom';
import {CreateVoyager} from './lib-voyager';
import {SerializableState} from './models/index';

const DEFAULT_TIMEOUT_LENGTH = 300;

describe('lib-voyager', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `<div id="root"></div>`;
    container = document.getElementById('root');
  });

  afterEach(done => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.innerHTML = "";
    setTimeout(done);
  });

  describe('CreateVoyager, updateData', () => {
    it('initializes with empty data and can be updated with customized data', done => {

      const data: any = {
        "values": [
          {"fieldA": "A", "fieldB": 28}, {"fieldA": "B", "fieldB": 55}, {"fieldA": "C", "fieldB": 43},
          {"fieldA": "D", "fieldB": 91}, {"fieldA": "E", "fieldB": 81}, {"fieldA": "F", "fieldB": 53},
          {"fieldA": "G", "fieldB": 19}, {"fieldA": "H", "fieldB": 87}, {"fieldA": "I", "fieldB": 52}
        ]
      };

      setTimeout(() => {
        try {
          const voyagerInst = CreateVoyager(container, undefined, undefined);
          const dataPaneHeader = document.querySelector('.load-data-pane__load-data-pane');
          expect(dataPaneHeader.textContent).toContain('Please load a dataset');

          setTimeout(() => {
            try {
              const fieldList = document.querySelectorAll('.field-list__field-list-item');
              expect(fieldList.length).toEqual(0);
              voyagerInst.updateData(data);
            } catch (err) {
              done.fail(err);
            }

            setTimeout(() => {
              try {
                const fieldList = document.querySelectorAll('.field-list__field-list-item');
                const fields = Array.prototype.map.call(fieldList, (d: Node) => d.textContent);

                expect(fields).toContain(' fieldA');
                expect(fields).toContain(' fieldB');

                done();
              } catch (err) {
                done.fail(err);
              }
            }, DEFAULT_TIMEOUT_LENGTH);
          }, DEFAULT_TIMEOUT_LENGTH);
        } catch (err) {
          done.fail(err);
        }
      }, 10);
    });
  });


  describe('get/setApplicationState', () => {
    it('gets and sets application state', done => {
      setTimeout(() => {
        try {
          const voyagerInst = CreateVoyager(container, undefined, undefined);
          const state = voyagerInst.getApplicationState();

          expect(state).toHaveProperty('config');
          expect(state).toHaveProperty('dataset');
          expect(state).toHaveProperty('result');
          expect(state).toHaveProperty('shelf');

          const originalConfigOption = state.config.showDataSourceSelector;
          state.config.showDataSourceSelector = !state.config.showDataSourceSelector;

          voyagerInst.setApplicationState(state);

          setTimeout(() => {
            try {
              const newState = voyagerInst.getApplicationState();

              expect(newState).toHaveProperty('config');
              expect(newState).toHaveProperty('dataset');
              expect(newState).toHaveProperty('result');
              expect(newState).toHaveProperty('shelf');

              expect(newState.config.showDataSourceSelector).toEqual(!originalConfigOption);

              done();
            } catch (err) {
              done.fail(err);
            }
          }, DEFAULT_TIMEOUT_LENGTH);

        } catch (err) {
          done.fail(err);
        }
      }, DEFAULT_TIMEOUT_LENGTH);
    });

    it('subscribes to state changes', done => {

      setTimeout(() => {
        try {
          const voyagerInst = CreateVoyager(container, undefined, undefined);

          const aState = voyagerInst.getApplicationState();
          const originalConfigOption = aState.config.showDataSourceSelector;
          aState.config.showDataSourceSelector = !aState.config.showDataSourceSelector;

          const handleStateChange = (state: SerializableState) => {
            expect(state.config).toBeDefined();
            expect(state.dataset).toBeDefined();
            expect(state.result).toBeDefined();
            expect(state.shelf).toBeDefined();

            expect(state.config.showDataSourceSelector).toEqual(!originalConfigOption);

            done();
          };

          voyagerInst.onStateChange(handleStateChange);

          setTimeout(() => {
            voyagerInst.setApplicationState(aState);
          }, DEFAULT_TIMEOUT_LENGTH);

        } catch (err) {
          done.fail(err);
        }
      }, DEFAULT_TIMEOUT_LENGTH);
    });

  });


  describe('vega-lite spec', () => {
    it('accepts valid spec', done => {
      setTimeout(() => {
        try {
          const voyagerInst = CreateVoyager(container, undefined, undefined);

          const spec: Object = {
            "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
            "data": {
              "values": [
                {"date": "24-Apr-07", "close": "93.24"},
                {"date": "25-Apr-07", "close": "95.35"},
                {"date": "26-Apr-07", "close": "98.84"},
                {"date": "27-Apr-07", "close": "99.92"}
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


          setTimeout(() => {
            try {
              const shelves = document.querySelectorAll('.encoding-shelf__encoding-shelf');
              const shelfText = Array.prototype.map.call(shelves, (d: Node) => d.textContent);

              expect(shelfText).toContain('x   binclose');
              done();
            } catch (err) {
              done.fail(err);
            }
          }, DEFAULT_TIMEOUT_LENGTH);

        } catch (err) {
          done.fail(err);
        }

      }, DEFAULT_TIMEOUT_LENGTH);
    });

    it('error on invalid spec', done => {
      const config = {};
      const data: any = undefined;

      const spec: Object = {
        "FAIL$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "FAILdata": {"url": "node_modules/vega-datasets/data/movies.json"},
        "FAILmark": "bar",
        "encoding": {
        }
      };
      const voyagerInst = CreateVoyager(container, config, data);

      // This should throw an exception;
      setTimeout(() => {
        try {
          voyagerInst.setSpec(spec);
          done.fail('No exception thrown with invalid spec');

        } catch (err) {
          expect(true);
          done();
        }

      }, DEFAULT_TIMEOUT_LENGTH);
    });

    it('getSpec returns Vega-Lite spec', done => {
      setTimeout(() => {
        try {
          const voyagerInst = CreateVoyager(container, undefined, undefined);
          const spec: Object = {
            "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
            "data": {
              "values": [
                {"date": "24-Apr-07", "close": "93.24"},
                {"date": "25-Apr-07", "close": "95.35"},
                {"date": "26-Apr-07", "close": "98.84"},
                {"date": "27-Apr-07", "close": "99.92"}
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

          setTimeout(() => {
            try {
              const retrievedSpec = voyagerInst.getSpec();
              expect(retrievedSpec).toEqual({
                data: {
                  name: 'source'
                },
                mark: 'bar',
                encoding: {
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
                },
                config: {
                  overlay: {
                    line: true
                  },
                  scale: {
                    useUnaggregatedDomain: true
                  }
                }
              });

              done();
            } catch (err) {
              done.fail(err);
            }
          }, DEFAULT_TIMEOUT_LENGTH);

        } catch (err) {
          done.fail(err);
        }

      }, DEFAULT_TIMEOUT_LENGTH);
    });
  });

});
