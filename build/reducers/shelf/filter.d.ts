import { OneOfFilter, RangeFilter } from 'vega-lite/build/src/filter';
import { Action } from '../../actions/index';
export declare function filterReducer(filters: Readonly<Array<RangeFilter | OneOfFilter>>, action: Action): Array<RangeFilter | OneOfFilter>;
