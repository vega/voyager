// tslint:disable:no-unused-variable
import {getTopSpecQueryItem, SpecQueryGroup} from 'compassql/build/src/model';
import {BoxPlotDef} from 'vega-lite/build/src/compositemark/boxplot';
import {EncodingWithFacet} from 'vega-lite/build/src/encoding';
import {MarkDef} from 'vega-lite/build/src/mark';
import {FacetedCompositeUnitSpec, GenericUnitSpec, isUnitSpec} from 'vega-lite/build/src/spec';
// tslint:enable:no-unused-variable

import {createSelector} from 'reselect';
import {Selector} from 'reselect/src/reselect';
import {Data} from 'vega-lite/build/src/data';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {State} from '../models/index';
import {PlotObject} from '../models/result';
import {Result, RESULT_TYPES, ResultType} from '../models/result';
import {getTransforms} from '../models/shelf/spec';
import {selectData} from './dataset';
import {selectFilters, selectIsQueryEmpty, selectIsQuerySpecific} from './shelf';

export const selectResult: {
  [k in ResultType]?: Selector<State, Result>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = (state: State) => state.undoable.present.result[resultType];
  return selectors;
}, {});


// This one is not exported as it does not correctly include filter transforms yet
const selectResultPlots: {
  [k in ResultType]?: Selector<State, PlotObject[]>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = (state: State) => state.undoable.present.result[resultType].plots;
  return selectors;
}, {});

export const selectMainSpec = createSelector(
  selectIsQuerySpecific,
  selectIsQueryEmpty,
  selectData,
  selectFilters,
  selectResultPlots.main,
  (
    isQuerySpecific: boolean,
    isQueryEmpty: boolean,
    data: Data,
    filters: Array<RangeFilter|OneOfFilter>,
    mainPlots: PlotObject[]
  ): FacetedCompositeUnitSpec => {
    if (!isQuerySpecific || !mainPlots || isQueryEmpty) {
      return undefined;
    }
    return {
      data: data,
      transform: getTransforms(filters),
      ...mainPlots[0].spec
    };
  }
);


// TODO(https://github.com/vega/voyager/issues/617): get rid of this once we bind data at runtime.
export const selectPlotList: {
  [k in ResultType]?: Selector<State, PlotObject[]>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = createSelector(
    selectIsQuerySpecific,
    selectData,
    selectFilters,
    selectResultPlots[resultType],
    (
      isQuerySpecific: boolean,
      data: Data,
      filters: Array<RangeFilter|OneOfFilter>,
      plots: PlotObject[]
    ) => {
      if (
          // For main, do not return list if specific.  For others, do not return list if not specific.
          ((resultType === 'main') === isQuerySpecific) ||
          !plots
        ) {
        return undefined;
      }
      return plots.map( p => ({
        ...p,
        transform: getTransforms(filters)
      }));
    }

  );
  return selectors;
}, {});
