import {isWildcard, SHORT_WILDCARD, WildcardProperty} from 'compassql/build/src/wildcard';

export function makeWildcard<T>(val: WildcardProperty<T>): WildcardProperty<T> {
  return isWildcard(val) ? val : SHORT_WILDCARD;
}
