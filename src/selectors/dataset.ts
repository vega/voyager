// tslint:disable:no-unused-variable
import {StateWithHistory} from 'redux-undo';
import {Selector} from 'reselect/src/reselect';
import {GenericState, UndoableStateBase} from '../models';
import {ResultPlot} from '../models/result';
// tslint:enable:no-unused-variable

import {Schema} from 'compassql/build/src/schema';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {createSelector} from 'reselect';
import {InlineData} from 'vega-lite/build/src/data';
import {ShelfFieldDef, State} from '../models';
import {Dataset} from '../models/dataset';

export const selectData = (state: State): InlineData => state.undoable.present.dataset.data;
export const selectDataset = (state: State): Dataset => state.undoable.present.dataset;
export const selectSchema = (state: State): Schema => state.undoable.present.dataset.schema;


const ALL_PRESET_WILDCARD_FIELDS: ShelfFieldDef[] = [
  {field: SHORT_WILDCARD, type: 'quantitative', description: 'Quantitative Fields'},
  {field: SHORT_WILDCARD, type: 'nominal', description: 'Categorical Fields'},
  {field: SHORT_WILDCARD, type: 'temporal', description: 'Temporal Fields'},
];

export const selectPresetWildcardFields = createSelector(
  selectSchema,
  (schema: Schema): ShelfFieldDef[] => {
    if (!schema) {
      return [];
    }
    const typeIndex = schema.fieldSchemas.reduce((index, fieldSchema) => {
      index[fieldSchema.vlType] = true;
      return index;
    }, {});

    return ALL_PRESET_WILDCARD_FIELDS.filter(fieldDef => typeIndex[fieldDef.type]);
  }
);

export const selectSchemaFieldDefs = createSelector(
  selectSchema,
  (schema: Schema): ShelfFieldDef[] => {
    if (!schema) {
      return [];
    }
    return schema.fieldSchemas.map(fieldSchema => {
      const {name, vlType} = fieldSchema;
      return {field: name, type: vlType};
    });
  }
);
