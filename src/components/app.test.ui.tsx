/**
 * @jest-environment jsdom
 */
import {mount} from 'enzyme';
import * as React from 'react';


import {Provider} from 'react-redux';
import {Data} from 'vega-lite/build/src/data';
import {FacetedCompositeUnitSpec, TopLevel} from 'vega-lite/build/src/spec';
import {configureStore} from '../store';
import {App} from './app';

const DEFAULT_TIMEOUT_LENGTH = 300;

describe('Voyager', () => {
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

          const dataPaneHeader = wrapper.find('.load-data-pane__load-data-pane');
          expect(dataPaneHeader.exists());
          expect(dataPaneHeader.text()).toContain('Please load a dataset');
        } catch (err) {
          done.fail(err);
        }
        done();
      }, DEFAULT_TIMEOUT_LENGTH);
    });

    it('renders voyager with custom data', done => {
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

          setTimeout(() => {
            try {
              const fieldList = wrapper.find('.field-list__field-list-item');
              const fields = fieldList.children().map(d => d.text());

              expect(fields).toContain(' fieldA');
              expect(fields).toContain(' fieldB');
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

  describe('vega-lite spec', () => {
    it('accepts valid spec', done => {
      const config = {};
      const store = configureStore();

      const values = [
        {date: "24-Apr-07", close: "93.24"},
        {date: "25-Apr-07", close: "95.35"},
        {date: "26-Apr-07", close: "98.84"},
        {date: "27-Apr-07", close: "99.92"},
      ];
      const data: Data = {values};
      const spec: TopLevel<FacetedCompositeUnitSpec> = {
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

      setTimeout(() => {
        try {
          const wrapper = mount(
            <Provider store={store}>
              <App
                config={config}
                data={data}
                dispatch={store.dispatch}
                spec={spec}
              />
            </Provider>,
          );

          setTimeout(() => {
            try {
              const fieldList = wrapper.find('.encoding-shelf__encoding-shelf');
              const fields = fieldList.map(d => d.text());

              expect(fields).toContain('x   binclose');
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
