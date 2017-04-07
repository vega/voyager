/**
 * @jest-environment jsdom
 */
import {mount} from 'enzyme';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {App} from './components/app';
import {CreateVoyager} from './lib-voyager';
import {configureStore} from './store';

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

  describe('instantiation via component', () => {
    it('renders voyager', done => {
      const config = {};
      const data: any = undefined;
      const store = configureStore();

      setTimeout(() => {
        try {
          const wrapper = mount(
            <Provider store={store}>
              <App
                  config={config}
                  data={data}
                  dispatch={store.dispatch}
              />
            </Provider>,
          );

          const dataPaneHeader = wrapper.find('.data-pane__data-pane h2');
          expect(dataPaneHeader.exists());
          expect(dataPaneHeader.text()).toContain('Data');
        } catch (err) {
          done.fail(err);
        }
        done();
      }, DEFAULT_TIMEOUT_LENGTH);

    });
  });

  describe('instantiation', () => {
    it('renders voyager on instantiation with DOM Node', done => {
      const config = {};
      const data: any = undefined;

      setTimeout(() => {
        try {
          CreateVoyager(container, config, data);
          const dataPaneHeader = document.querySelector('.data-pane__data-pane h2');
          expect(dataPaneHeader.textContent).toContain('Data');
          done();
        } catch (err) {
          done.fail(err);
        }
      }, DEFAULT_TIMEOUT_LENGTH);
    });
  });

  describe('data', () => {
    it('initialize with custom data', done => {

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
          const dataPaneHeader = document.querySelector('.data-pane__data-pane h2');
          expect(dataPaneHeader.textContent).toContain('Data');

          setTimeout(() => {
            try {
              const fieldList = document.querySelectorAll('.field-list__field-list-item');
              const fields = Array.prototype.map.call(fieldList, (d: Node) => d.textContent);

              expect(fields).toContain(' q1');
              expect(fields).toContain(' q2');

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

                expect(fields).not.toContain(' q1');
                expect(fields).not.toContain(' q2');

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


  describe('applicationState', () => {
    it('gets initial application state', done => {

      setTimeout(() => {
        try {
          const voyagerInst = CreateVoyager(container, undefined, undefined);
          const state = voyagerInst.getApplicationState();

          expect(state).toHaveProperty('config');
          expect(state).toHaveProperty('dataset');
          expect(state).toHaveProperty('result');
          expect(state).toHaveProperty('shelf');

          done();
        } catch (err) {
          done.fail(err);
        }
      }, DEFAULT_TIMEOUT_LENGTH);
    });

    it('sets application state', done => {

      setTimeout(() => {
        try {
          const voyagerInst = CreateVoyager(container, undefined, undefined);
          const state = voyagerInst.getApplicationState();

          expect(state).toHaveProperty('config');

          const originalConfigOption = state.config.showDataSourceSelector;
          state.config.showDataSourceSelector = !state.config.showDataSourceSelector;

          voyagerInst.setApplicationState(state);

          setTimeout(() => {
            const newState = voyagerInst.getApplicationState();

            expect(newState).toHaveProperty('config');
            expect(newState).toHaveProperty('dataset');
            expect(newState).toHaveProperty('result');
            expect(newState).toHaveProperty('shelf');

            expect(newState.config.showDataSourceSelector).toEqual(!originalConfigOption);

            done();
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

          const handleStateChange = (state: any) => {
            expect(state).toHaveProperty('config');
            expect(state).toHaveProperty('dataset');
            expect(state).toHaveProperty('result');
            expect(state).toHaveProperty('shelf');

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

          const values = [
            {date: "24-Apr-07", close: "93.24"},
            {date: "25-Apr-07", close: "95.35"},
            {date: "26-Apr-07", close: "98.84"},
            {date: "27-Apr-07", close: "99.92"},
          ];

          const spec: Object = {
            "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
            "data": {
              values
            },
            "mark": "bar",
            "encoding": {
              "x": {
                "bin": {"maxbins": 10},
                "field": "close",
                "type": "quantitative"
              },
              "y": {
                "aggregate": "count",
                "type": "quantitative"
              }
            }
          };
          voyagerInst.setSpec(spec);

          setTimeout(() => {
            try {
              const shelves = document.querySelectorAll('.encoding-shelf__encoding-shelf');
              const shelfText = Array.prototype.map.call(shelves, (d: Node) => d.textContent);

              expect(shelfText).toContain('x binclose');
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
