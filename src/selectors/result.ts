
import {getTopSpecQueryItem} from 'compassql/build/src/model';
import {StateWithHistory} from 'redux-undo';
import {createSelector} from 'reselect';
import {Selector} from 'reselect/src/reselect';
import {Data} from 'vega-lite/build/src/data';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {State, StateBase} from '../models/index';
import {extractPlotObjects, PlotObject} from '../models/plot';
import {Result, RESULT_TYPES, ResultType} from '../models/result';
import {getTransforms} from '../models/shelf/spec';
import {selectData} from './dataset';
import {selectFilters, selectIsQuerySpecific} from './shelf';

// tslint:disable:no-unused-variable
import {BoxPlotDef} from 'vega-lite/build/src/compositemark/boxplot';
import {EncodingWithFacet} from 'vega-lite/build/src/encoding';
import {MarkDef} from 'vega-lite/build/src/mark';
import {FacetedCompositeUnitSpec, GenericUnitSpec} from 'vega-lite/build/src/spec';
// tslint:enable:no-unused-variable

export const selectResult: {
  [k in ResultType]?: Selector<StateWithHistory<StateBase>, Result>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = (state: State) => state.present.result[resultType];
  return selectors;
}, {});

export const selectMainSpec = createSelector(
  selectIsQuerySpecific,
  selectData,
  selectFilters,
  selectResult.main,
  (
    isQuerySpecific: boolean,
    data: Data,
    filters: Array<RangeFilter|OneOfFilter>,
    mainResult: Result
  ): FacetedCompositeUnitSpec => {
    if (!isQuerySpecific || !mainResult.modelGroup) {
      return undefined;
    }
    return {
      data: data,
      transform: getTransforms(filters),
      ...getTopSpecQueryItem(mainResult.modelGroup).spec
    };
  }
);
export const selectPlotList: {
  [k in ResultType]?: Selector<StateWithHistory<StateBase>, PlotObject[]>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = createSelector(
    selectIsQuerySpecific,
    selectData,
    selectFilters,
    selectResult[resultType],
    (
      isQuerySpecific: boolean,
      data: Data,
      filters: Array<RangeFilter|OneOfFilter>,
      result: Result,
    ) => {
      if (
          // For main, do not return list if specific.  For others, do not return list if not specific.
          ((resultType === 'main') === isQuerySpecific) ||
          !result.modelGroup
        ) {
        return undefined;
      }
      // FIXME(https://github.com/vega/voyager/issues/448): use data and filter
      return extractPlotObjects(result.modelGroup, filters);
    }

  );
  return selectors;
}, {});
