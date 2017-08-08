import {isWildcard, SHORT_WILDCARD, WildcardProperty} from 'compassql/build/src/wildcard';
import {GroupBy} from 'compassql/src/query/groupby';
export const GROUP_BY_SIMILAR_DATA_AND_TRANSFORM: GroupBy = ['field', 'aggregate', 'bin', 'timeUnit', 'type'];

export const GROUP_BY_SIMILAR_ENCODINGS: GroupBy = GROUP_BY_SIMILAR_DATA_AND_TRANSFORM.concat({
  property: 'channel',
  replace: {
    'x': 'xy', 'y': 'xy',
    'color': 'style', 'size': 'style', 'shape': 'style', 'opacity': 'style',
    'row': 'facet', 'column': 'facet'
  }
});

export function makeWildcard<T>(val: WildcardProperty<T>): WildcardProperty<T> {
  return isWildcard(val) ? val : SHORT_WILDCARD;
}
