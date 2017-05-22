import {CreateVoyager} from './lib-voyager';


describe('lib-voyagaer', () => {
  describe('instantiation', () => {
    test('renders voyager on instantiation with DOM Node', () => {

      document.body.innerHTML = `
        <div id="customRoot1"></div>
      `;

      const config = {};
      const data: any = undefined;
      const container = document.getElementById('customRoot1');
      CreateVoyager(container, config, data);

      const header = document.querySelector('header');
      expect(header.textContent).toContain('Voyager 2');
    });
  });
});