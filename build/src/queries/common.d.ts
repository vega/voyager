import { WildcardProperty } from 'compassql/build/src/wildcard';
import { GroupBy } from 'compassql/src/query/groupby';
export declare const GROUP_BY_SIMILAR_DATA_AND_TRANSFORM: GroupBy;
export declare const GROUP_BY_SIMILAR_ENCODINGS: GroupBy;
export declare function makeWildcard<T>(val: WildcardProperty<T>): WildcardProperty<T>;
