// tslint:disable:no-unused-variable
import {getTopSpecQueryItem, SpecQueryGroup} from 'compassql/build/src/model';
import {createSelector} from 'reselect';
import {Selector} from 'reselect/src/reselect';
import {BoxPlotDef} from 'vega-lite/build/src/compositemark/boxplot';
import {Data} from 'vega-lite/build/src/data';
import {EncodingWithFacet} from 'vega-lite/build/src/encoding';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {MarkDef} from 'vega-lite/build/src/mark';
import {FacetedCompositeUnitSpec, GenericUnitSpec, isUnitSpec} from 'vega-lite/build/src/spec';
import {State} from '../models/index';
import {extractPlotObjects, PlotObject} from '../models/plot';
import {Result, RESULT_TYPES, ResultType} from '../models/result';
import {getTransforms} from '../models/shelf/spec';
import {selectData} from './dataset';
import {selectFilters, selectIsQueryEmpty, selectIsQuerySpecific} from './shelf';
// tslint:enable:no-unused-variable

export const selectResult: {
  [k in ResultType]?: Selector<State, Result>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = (state: State) => state.undoable.present.result[resultType];
  return selectors;
}, {});

export const selectResultModelGroup: {
  [k in ResultType]?: Selector<State, SpecQueryGroup<PlotObject>>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = (state: State) => state.undoable.present.result[resultType].modelGroup;
  return selectors;
}, {});

export const selectMainSpec = createSelector(
  selectIsQuerySpecific,
  selectIsQueryEmpty,
  selectData,
  selectFilters,
  selectResultModelGroup.main,
  (
    isQuerySpecific: boolean,
    isQueryEmpty: boolean,
    data: Data,
    filters: Array<RangeFilter|OneOfFilter>,
    mainModelGroup: SpecQueryGroup<PlotObject>
  ): FacetedCompositeUnitSpec => {
    if (!isQuerySpecific || !mainModelGroup || isQueryEmpty) {
      return undefined;
    }
    return {
      data: data,
      transform: getTransforms(filters),
      ...getTopSpecQueryItem(mainModelGroup).spec
    };
  }
);
export const selectPlotList: {
  [k in ResultType]?: Selector<State, PlotObject[]>
} = RESULT_TYPES.reduce((selectors, resultType) => {
  selectors[resultType] = createSelector(
    selectIsQuerySpecific,
    selectData,
    selectFilters,
    selectResultModelGroup[resultType],
    (
      isQuerySpecific: boolean,
      data: Data,
      filters: Array<RangeFilter|OneOfFilter>,
      modelGroup: SpecQueryGroup<PlotObject>
    ) => {
      if (
          // For main, do not return list if specific.  For others, do not return list if not specific.
          ((resultType === 'main') === isQuerySpecific) ||
          !modelGroup
        ) {
        return undefined;
      }
      // FIXME(https://github.com/vega/voyager/issues/448): use data and filter
      return extractPlotObjects(modelGroup, filters);
    }

  );
  return selectors;
}, {});
