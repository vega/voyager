
import {Query} from 'compassql/build/src/query/query';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {QueryCreator} from './base';

export const histograms: QueryCreator = {
  type: 'histograms',
  title: 'Univariate Summaries',
  filterGroupBy: undefined,
  createQuery(query: Query): Query {
    return {
      spec: {
        data: query.spec.data,
        mark: SHORT_WILDCARD,
        transform: query.spec.transform,
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
      // FieldOrder should dominates everything else
      orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
      // aggregationQuality should be the same
      chooseBy: ['aggregationQuality', 'effectiveness'],
      config: { autoAddCount: false }
    };
  }
};
