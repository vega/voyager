import {autoAddFieldQuery, DEFAULT_CHOOSE_BY, DEFAULT_ORDER_BY, toQuery} from './index';

describe('models/shelf', () => {
  describe('autoAddFieldQuery', () => {
    it('makes a query that has an additional fieldQuery with wildcard channel', () => {
      expect(
        autoAddFieldQuery({
          filters: [],
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          },
          anyEncodings: [],
          config: {numberFormat: 'd'}
        }, {field: 'b', type: 'nominal'})
      ).toEqual({
        spec: {
          transform: [],
          mark: 'point',
          encodings: [
            {channel: 'x', field: 'a', type: 'quantitative'},
            {channel: '?', field: 'b', type: 'nominal'}
          ],
          config: {numberFormat: 'd'}
        },
        chooseBy: 'effectiveness'
      });
    });
  });

  describe('toQuery', () => {
    it('returns a query that groups by encoding and does not auto add count ' +
        'if there is no wildcard', () => {
      expect(toQuery({
        spec: {
          filters: [],
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          },
          anyEncodings: [],
          config: {numberFormat: 'd'}
        },
        autoAddCount: false,
        groupBy: 'auto'
      })).toEqual({
        spec: {
          transform: [],
          mark: 'point',
          encodings: [
            {channel: 'x', field: 'a', type: 'quantitative'},
          ],
          config: {numberFormat: 'd'}
        },
        groupBy: 'encoding',
        chooseBy: DEFAULT_CHOOSE_BY,
        orderBy: DEFAULT_ORDER_BY
      });
    });

    it('returns the query that groups by field and autoAddCount' +
       'if there is a wildcard field and autoAddCount is true', () => {
      expect(toQuery({
        spec: {
          filters: [],
          mark: 'point',
          encoding: {
            x: {field: '?', type: 'quantitative'}
          },
          anyEncodings: [],
          config: {numberFormat: 'd'}
        },
        groupBy: 'auto',
        autoAddCount: true
      })).toEqual({
        spec: {
          transform: [],
          mark: 'point',
          encodings: [
            {channel: 'x', field: '?', type: 'quantitative'},
          ],
          config: {numberFormat: 'd'}
        },
        groupBy: 'field',
        chooseBy: DEFAULT_CHOOSE_BY,
        orderBy: DEFAULT_ORDER_BY,
        config:  {
          autoAddCount: true
        }
      });
    });

    // TODO: WILDCARD TEST NOT YET SUPPORTED
    // it('returns the query that groups by field transform and auto add count' +
    //     'if there is a wildcard field and function', () => {
    //   expect(toQuery({
    //     spec: {
    //       filters: [],
    //       mark: 'point',
    //       encoding: {
    //         x: {fn: INSERT PROPER FN HERE, field: '?', type: 'quantitative'}
    //       },
    //       anyEncodings: [],
    //       config: {numberFormat: 'd'}
    //     }
    //   })).toEqual({
    //     spec: {
    //       transform: [],
    //       mark: 'point',
    //       encodings: [
    //         {channel: 'x', field: '?', SHORT WILDCARD HERE, type: 'quantitative'},
    //       ],
    //       config: {numberFormat: 'd'}
    //     },
    //     groupBy: 'fieldTransform',
    //     chooseBy: DEFAULT_CHOOSE_BY,
    //     orderBy: DEFAULT_ORDER_BY,
    //     config:  {
    //       autoAddCount: true
    //     }
    //   });
    // });
  });
});
