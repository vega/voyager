import {Query} from 'compassql/build/src/query/query';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {summaries} from './summaries';


describe('queries/summaries', () => {
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
    expect(summaries.createQuery(query)).toEqual({
      spec: {
        transform: [{
          filter: {
            field: 'a',
            oneOf: ['1, 2']
          }
        }],
        mark: SHORT_WILDCARD,
        encodings: [{
          channel: 'y',
          bin: SHORT_WILDCARD,
          aggregate: SHORT_WILDCARD,
          hasFn: true,
          field: 'a',
          type: 'quantitative'
        }, {
          channel: 'color',
          field: 'b',
          type: 'nominal'
        }, {
          channel: 'x',
          timeUnit: SHORT_WILDCARD,
          field: 'c',
          type: 'temporal'
        }]
      },
      groupBy: 'fieldTransform',
      orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
      chooseBy: ['aggregationQuality', 'effectiveness'],
      config: {autoAddCount: true, omitRaw: true}
    });
  });
});
