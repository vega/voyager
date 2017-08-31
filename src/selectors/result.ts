// tslint:disable:no-unused-variable
import {getTopSpecQueryItem, SpecQueryGroup} from 'compassql/build/src/model';
import {BoxPlotDef} from 'vega-lite/build/src/compositemark/boxplot';
import {EncodingWithFacet} from 'vega-lite/build/src/encoding';
import {MarkDef} from 'vega-lite/build/src/mark';
import {FacetedCompositeUnitSpec, GenericUnitSpec, isUnitSpec} from 'vega-lite/build/src/spec';
// tslint:enable:no-unused-variable

import {createSelector} from 'reselect';
import {Selector} from 'reselect/src/reselect';
import {State} from '../models/index';
import {ResultPlot} from '../models/result';
import {Result, RESULT_TYPES, ResultType} from '../models/result';
import {selectIsQueryEmpty, selectIsQuerySpecific} from './shelf';

export const selectResult: {
  [k in ResultType]?: Selector<State, Result>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = (state: State) => state.undoable.present.result[resultType];
  return selectors;
}, {});

export const selectResultLimit: {
  [k in ResultType]?: Selector<State, number>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = createSelector(
    selectResult[resultType],
    (result: Result) => result.limit
  );
  return selectors;
}, {});

// This one is not exported as it does not correctly include filter transforms yet
const selectResultPlots: {
  [k in ResultType]?: Selector<State, ResultPlot[]>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = createSelector(
    selectResult[resultType],
    (result: Result) => result.plots
  );
  return selectors;
}, {});

export const selectMainSpec = createSelector(
  selectIsQuerySpecific,
  selectIsQueryEmpty,
  selectResultPlots.main,
  (
    isQuerySpecific: boolean,
    isQueryEmpty: boolean,
    mainPlots: ResultPlot[]
  ): FacetedCompositeUnitSpec => {
    if (!isQuerySpecific || !mainPlots || isQueryEmpty) {
      return undefined;
    }
    return mainPlots[0].spec;
  }
);
