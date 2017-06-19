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

          const header = wrapper.find('header');
          expect(header.exists());
          expect(header.text()).toContain('Voyager 2');
        } catch (err) {
          done.fail(err);
        }
        done();
      }, 10);

    });
  });

  describe('instantiation', () => {
    it('renders voyager on instantiation with DOM Node', done => {
      const config = {};
      const data: any = undefined;

      setTimeout(() => {
        try {
          CreateVoyager(container, config, data);
          const header = document.querySelector('header');
          expect(header.textContent).toContain('Voyager 2');
          done();
        } catch (err) {
          done.fail(err);
        }
      }, 10);
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
          const header = document.querySelector('header');
          expect(header.textContent).toContain('Voyager 2');

          setTimeout(() => {
            let fieldList = document.querySelectorAll('.field-list__field-list-item');
            let fields = Array.prototype.map.call(fieldList, (d: Node) => d.textContent);

            expect(fields).toContain('q1');
            expect(fields).toContain('q2');

            voyagerInst.updateData(data);

            setTimeout(() => {
              fieldList = document.querySelectorAll('.field-list__field-list-item');
              fields = Array.prototype.map.call(fieldList, (d: Node) => d.textContent);

              expect(fields).toContain('fieldA');
              expect(fields).toContain('fieldB');

              expect(fields).not.toContain('q1');
              expect(fields).not.toContain('q2');

              done();
            }, 200);
          }, 200);
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
      }, 10);
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
          }, 100);

        } catch (err) {
          done.fail(err);
        }
      }, 10);
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
          }, 50);



        } catch (err) {
          done.fail(err);
        }
      }, 10);
    });

  });



});
