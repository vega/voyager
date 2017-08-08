import {isFieldQuery} from 'compassql/build/src/query/encoding';
import {Query} from 'compassql/build/src/query/query';
import {QueryCreator} from './base';
import {GROUP_BY_SIMILAR_DATA_AND_TRANSFORM, makeWildcard} from './common';

export const summaries: QueryCreator = {
  type: 'summaries',
  title: 'Related Summaries',
  filterGroupBy: GROUP_BY_SIMILAR_DATA_AND_TRANSFORM,
  createQuery(query: Query): Query {
    const {spec} = query;
    const newSpec = {
      ...spec,
      mark: makeWildcard(spec.mark),
      encodings: spec.encodings.reduce((encodings, encQ) => {
        if (isFieldQuery(encQ)) {
          switch (encQ.type) {
            case 'quantitative':
              if (encQ.aggregate === 'count') {
                // Skip count, so that it can be added back as autoCount or omitted
                return encodings;
              } else {
                // For other Q, it should be either aggregate or binned
                return encodings.concat({
                  ...encQ,
                  aggregate: makeWildcard(encQ.aggregate),
                  bin: makeWildcard(encQ.bin as any),  // HACK as TS somehow incorrectly infer types here
                  hasFn: true
                });
              }
            case 'temporal':
              // TODO: only year and periodic timeUnit
              return encodings.concat({
                ...encQ,
                timeUnit: makeWildcard(encQ.timeUnit)
              });
            case 'nominal':
            case 'ordinal':
            case 'key':
              return encodings.concat(encQ);
          }
          throw new Error('Unsupported type in related summaries query creator.');
        }
        return encodings;
      }, [])
    };

  // TODO: extend config
    return {
      spec: newSpec,
      groupBy: 'fieldTransform',
      // fieldOrder should be the same, since we have similar fields
      orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
      // aggregationQuality should be the same with group with similar transform
      chooseBy: ['aggregationQuality', 'effectiveness'],
      config: {
        autoAddCount: true,
        omitRaw: true
      }
    };
  }
};
