/**
 * @jest-environment jsdom
 */
import {mount} from 'enzyme';
import * as React from 'react';


import {Provider} from 'react-redux';
import {configureStore} from '../store';
import {App} from './app';

describe('Voyager', () => {

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


    test('renders voyager with custom data', done => {
      const config = {};
      const data: any = {
        "values": [
          {"fieldA": "A", "fieldB": 28}, {"fieldA": "B", "fieldB": 55}, {"fieldA": "C", "fieldB": 43},
          {"fieldA": "D", "fieldB": 91}, {"fieldA": "E", "fieldB": 81}, {"fieldA": "F", "fieldB": 53},
          {"fieldA": "G", "fieldB": 19}, {"fieldA": "H", "fieldB": 87}, {"fieldA": "I", "fieldB": 52}
        ]
      };
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

          const fieldList = wrapper.find('.field-list__field-list-item');
          const fields = fieldList.children();

          // expect(fieldList.get(0).text()).toBe("fieldA"); // TODO Fix;
          // expect(fieldList.get(0).text()).toBe("fieldB");

          expect(fields.length).toBe(2 + 3); // voyager adds some extra fields



          done();
        } catch (err) {
          done.fail(err);
        }
      }, 10);
    });

  });

});
