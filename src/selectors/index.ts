// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944

// tslint:disable:no-unused-variable
import {StateWithHistory} from 'redux-undo';
import {GenericState, UndoableStateBase} from '../models';
// tslint:enable:no-unused-variable

import {createSelector} from 'reselect';
import {InlineData} from 'vega-lite/build/src/data';
import {isArray} from 'vega-util';
import {State} from '../models';
import {Bookmark} from '../models/bookmark';
import {VoyagerConfig} from '../models/config';
import {CustomWildcardField} from '../models/custom-wildcard-field';
import {Log} from '../models/log';
import {RelatedViews} from '../models/related-views';
import {ShelfPreview} from '../models/shelf-preview';
import {ShelfFilter, toPredicateFunction} from '../models/shelf/filter';
import {selectData} from './dataset';
import {selectFilters} from './shelf';

export * from './dataset';
export * from './result';
export * from './shelf';
export * from './tab';

export const selectBookmark = (state: State): Bookmark => state.persistent.bookmark;
export const selectConfig = (state: State): VoyagerConfig => state.persistent.config;
export const selectRelatedViews = (state: State): RelatedViews => state.persistent.relatedViews;
export const selectShelfPreview = (state: State): ShelfPreview => state.persistent.shelfPreview;
export const selectLog = (state: State): Log => state.persistent.log;

export const selectCustomWildcardFields = (state: State): CustomWildcardField[] => {
  return state.undoable.present.customWildcardFields;
};

export const selectFilteredData = createSelector(
  selectData,
  selectFilters,
  (data: InlineData, filters: ShelfFilter[]): InlineData => {
    if (!data || filters.length === 0) {
      return data;
    }
    const filter = toPredicateFunction(filters);
    if (!isArray(data.values)) {
      throw new Error('Voyager only supports array values');
    }
    // FIXME: No signatures error
    const dataVals = data.values as any;
    const values = dataVals.filter(filter);
    return {values};
  }
);

