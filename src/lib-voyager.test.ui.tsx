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
    test('renders voyager', done => {
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
    test('renders voyager on instantiation with DOM Node', done => {
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

  describe.skip('data', () => {
    let originalTimeout: number;
    beforeEach(done => {
      jest.useRealTimers();
      // tslint:disable-next-line:no-string-literal
      originalTimeout = jasmine['DEFAULT_TIMEOUT_INTERVAL'];
      // tslint:disable-next-line:no-string-literal
      jasmine['DEFAULT_TIMEOUT_INTERVAL'] = 20000;
      done();
    });

    afterEach(done => {
      // tslint:disable-next-line:no-string-literal
      jasmine['DEFAULT_TIMEOUT_INTERVAL'] = originalTimeout;
      jest.useFakeTimers();
      done();
    });


    test('initialize with custom data', done => {

      const config = {};
      const data: any = {
        "values": [
          {"fieldA": "A", "fieldB": 28}, {"fieldA": "B", "fieldB": 55}, {"fieldA": "C", "fieldB": 43},
          {"fieldA": "D", "fieldB": 91}, {"fieldA": "E", "fieldB": 81}, {"fieldA": "F", "fieldB": 53},
          {"fieldA": "G", "fieldB": 19}, {"fieldA": "H", "fieldB": 87}, {"fieldA": "I", "fieldB": 52}
        ]
      };

      setTimeout(() => {
        try {
          CreateVoyager(container, config, data);

          setTimeout(() => {
            const fieldList = document.querySelectorAll('.field-list__field-list-item');
            const fields = Array.prototype.map.call(fieldList, (d: Node) => d.textContent);

            expect(fieldList.length).toBe(2);
            expect(fields).toBe(['fieldA', 'fieldB']);
            done();
          }, 4000);

          // tslint:disable-next-line:no-string-literal
          // const _store = voyager['store'];
          // _store.subscribe(() => {
          //   const state = _store.getState();
          //   console.log('store has changed', state, state.past[0]["dataset"])
          //   if (state.present.dataset.name === "Custom Data") {

          //     const fieldList = document.querySelectorAll('.field-list__field-list-item');
          //     const fields = Array.prototype.map.call(fieldList, (d: Node) => d.textContent);
          //     console.log("WE GOT OUR DATA")
          //     console.log("FEFFE", fields)
          //     expect(fieldList.length).toBe(2);
          //     expect(fields).toBe(['fieldA', 'fieldB']);
          //     done();
          //   }
          // });


        } catch (err) {
          done.fail(err);
        }
      }, 10);

    });
  });
});
