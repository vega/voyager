/**
 * @jest-environment jsdom
 */

import * as ReactDOM from 'react-dom';
import {CreateVoyager} from './lib-voyager';

jest.useRealTimers();
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;


describe('lib-voyagaer', () => {

  let container: HTMLElement;

  beforeEach(done => {
    document.body.innerHTML = `<div id="root">The Container</div>`;
    container = document.getElementById('root');
    console.log("Before Done")
    setTimeout(done);
  });

  afterEach(done => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.innerHTML = "";
    console.log("AfterEach Done")
    setTimeout(done);
  });

  describe('instantiation', () => {
    test('renders voyager on instantiation with DOM Node', (done) => {
      const config = {};
      const data: any = undefined;

      console.log("Container", container.innerHTML)
      // console.log("jasmine", jasmine, jasmine.DEFAULT_TIMEOUT_INTERVAL)
      setTimeout(() => {
        try {
          CreateVoyager(container, config, data);
        } catch (err) {
          done.fail(err);
        }

        const header = document.querySelector('header');
        expect(header.textContent).toContain('Voyager 2');
        done();
      }, 100);



    });



  });

  describe.skip('data', () => {
    let originalTimeout: number;
    beforeEach((done) => {
      jest.useRealTimers();
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      done();
    });

    afterEach((done) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      done();
      jest.useFakeTimers();
    });


    test('set custom data', done => {

      const config = {};
      const data: any = {
        "values": [
          {"fieldA": "A", "fieldB": 28}, {"fieldA": "B", "fieldB": 55}, {"fieldA": "C", "fieldB": 43},
          {"fieldA": "D", "fieldB": 91}, {"fieldA": "E", "fieldB": 81}, {"fieldA": "F", "fieldB": 53},
          {"fieldA": "G", "fieldB": 19}, {"fieldA": "H", "fieldB": 87}, {"fieldA": "I", "fieldB": 52}
        ]
      };

      CreateVoyager(container, config, data);
      console.log("BEFORE STO")

      setTimeout(() => {
        const fieldList = document.querySelector('.FieldList') as HTMLElement;
        console.log("FIELD LIST", fieldList.innerText)
        expect(fieldList.innerText.split('\n')).toBe(['fieldA', 'fieldB']);
        done();
      }, 1750);

      console.log("AFTER STO")

    });
  });
});
