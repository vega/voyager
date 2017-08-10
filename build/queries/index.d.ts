/**
 * Namespace for creating CompassQL query specifications.
 */
import { Query } from 'compassql/build/src/query/query';
import { Store } from 'redux';
import { State } from '../models/index';
import { ResultType } from '../models/result';
import { QueryCreator } from './base';
export declare const RELATED_VIEWS_INDEX: {
    [k in ResultType]: QueryCreator;
};
export declare const RELATED_VIEWS_TYPES: ("main" | "addCategoricalField" | "addQuantitativeField" | "addTemporalField" | "alternativeEncodings" | "histograms" | "summaries")[];
export declare function dispatchQueries(store: Store<State>, query: Query): void;
export declare function makeRelatedViewQueries(store: Store<State>, query: Query): void;
