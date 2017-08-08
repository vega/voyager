import {Query} from 'compassql/build/src/query/query';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {histograms} from './histograms';


describe('queries/histogram', () => {
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
        encodings: []
      }
    };
    expect(histograms.createQuery(query)).toEqual({
      spec: {
        transform: [{
          filter: {
            field: 'a',
            oneOf: ['1, 2']
          }
        }],
        mark: SHORT_WILDCARD,
        encodings: [
          {
            channel: SHORT_WILDCARD,
            bin: SHORT_WILDCARD, timeUnit: SHORT_WILDCARD,
            field: SHORT_WILDCARD,
            type: SHORT_WILDCARD
          },
          {
            channel: SHORT_WILDCARD,
            aggregate: 'count',
            field: '*',
            type: 'quantitative'
          }
        ]
      },
      groupBy: 'fieldTransform',
      orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
      chooseBy: ['aggregationQuality', 'effectiveness'],
      config: { autoAddCount: false }
    });
  });
});
