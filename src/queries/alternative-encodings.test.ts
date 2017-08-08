import {Query} from 'compassql/build/src/query/query';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {alternativeEncodings} from './alternative-encodings';


describe('queries/alternative-encodings', () => {
  it('should correctly produce a query', () => {
    const query: Query = {
      spec: {
        transform: [{
          filter: {
            field: 'a',
            oneOf: ['1, 2']
          }
        }],
        mark: 'point',
        encodings: [{
          channel: 'y',
          field: 'a',
          type: 'quantitative'
        }, {
          channel: 'color',
          field: 'b',
          type: 'nominal'
        }, {
          channel: 'x',
          field: 'c',
          type: 'temporal'
        }]
      }
    };

    expect(alternativeEncodings.createQuery(query)).toEqual({
      spec: {
        transform: [{
          filter: {
            field: 'a',
            oneOf: ['1, 2']
          }
        }],
        mark: SHORT_WILDCARD,
        encodings: [{
          channel: SHORT_WILDCARD,
          field: 'a',
          type: 'quantitative'
        }, {
          channel: SHORT_WILDCARD,
          field: 'b',
          type: 'nominal'
        }, {
          channel: SHORT_WILDCARD,
          field: 'c',
          type: 'temporal'
        }]
      },
      groupBy: 'encoding',
      orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
      chooseBy: ['aggregationQuality', 'effectiveness']
    });
  });
});
