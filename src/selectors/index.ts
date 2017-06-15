import {Schema} from 'compassql/build/src/schema';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {createSelector} from 'reselect';

import {Shelf, ShelfFieldDef, State, toQuery} from '../models';

export const getData = (state: State) => state.present.dataset.data;
export const getShelf = (state: State) => state.present.shelf;
export const getSchema = (state: State) => state.present.dataset.schema;
export const getMainResult = (state: State) => state.present.result.main.modelGroup;
export const getConfig = (state: State) => state.present.config;

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
