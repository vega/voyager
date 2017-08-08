
import {Query} from 'compassql/build/src/query/query';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {QueryCreator} from './base';
import {GROUP_BY_SIMILAR_ENCODINGS, makeWildcard} from './common';

export const alternativeEncodings: QueryCreator = {
  type: 'alternativeEncodings',
  title: 'Alternative Encodings',
  filterGroupBy: GROUP_BY_SIMILAR_ENCODINGS,
  createQuery(query: Query): Query {
    const {spec} = query;
    const {mark, encodings} = spec;
    return {
      spec: {
        ...query.spec,
        mark: makeWildcard(mark),
        encodings: encodings.map(encQ => {
          if (isWildcard(encQ.channel)) {
            return encQ;
          }
          return {
            ...encQ,
            channel: SHORT_WILDCARD
          };
        })
      },
      groupBy: 'encoding',
      // fieldOrder, aggregationQuality should be the same, since we have similar fields and aggregates
      orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
      chooseBy: ['aggregationQuality', 'effectiveness']
    };
  }
};
