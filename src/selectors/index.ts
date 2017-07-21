import {Schema} from 'compassql/build/src/schema';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {createSelector} from 'reselect';

import {Shelf, ShelfFieldDef, State, toQuery} from '../models';


// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944
// tslint:disable-next-line:no-unused-variable
import {SpecQueryGroup} from 'compassql/build/src/model';
// tslint:disable-next-line:no-unused-variable
import {Query} from 'compassql/build/src/query/query';
// tslint:disable-next-line:no-unused-variable
import {StateWithHistory} from 'redux-undo';
// tslint:disable-next-line:no-unused-variable
import {InlineData, NamedData, UrlData} from 'vega-lite/build/src/data';
// tslint:disable-next-line:no-unused-variable
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
// tslint:disable-next-line:no-unused-variable
import {StateBase, VoyagerConfig} from '../models';
// tslint:disable-next-line:no-unused-variable
import {Bookmark} from '../models/bookmark';
// tslint:disable-next-line:no-unused-variable
import {PlotObject} from '../models/plot';

export const getBookmark = (state: State) => state.present.bookmark;
export const getConfig = (state: State) => state.present.config;
export const getData = (state: State) => state.present.dataset.data;
export const getFilters = (state: State) => state.present.shelf.spec.filters;
export const getShelf = (state: State) => state.present.shelf;
export const getSchema = (state: State) => state.present.dataset.schema;
export const getMainResult = (state: State) => state.present.result.main.modelGroup;

export const getQuery = createSelector(
  getShelf,
  (shelf: Shelf) => {
    return toQuery(shelf);
  }
);

const ALL_PRESET_WILDCARD_FIELDS: ShelfFieldDef[] = [
  {field: SHORT_WILDCARD, type: 'quantitative', title: 'Quantitative Fields'},
  {field: SHORT_WILDCARD, type: 'nominal', title: 'Categorical Fields'},
  {field: SHORT_WILDCARD, type: 'temporal', title: 'Temporal Fields'},
];

export const getPresetWildcardFields = createSelector(
  getSchema,
  (schema: Schema): ShelfFieldDef[] => {
    const typeIndex = schema.fieldSchemas.reduce((index, fieldSchema) => {
      index[fieldSchema.vlType] = true;
      return index;
    }, {});

    return ALL_PRESET_WILDCARD_FIELDS.filter(fieldDef => typeIndex[fieldDef.type]);
  }
);


export const getSchemaFieldDefs = createSelector(
  getSchema,
  (schema: Schema): ShelfFieldDef[] => {
    return schema.fieldSchemas.map(fieldSchema => {
      const {name, vlType} = fieldSchema;
      return {field: name, type: vlType};
    });
  }
);
