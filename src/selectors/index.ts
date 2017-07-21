import {Schema} from 'compassql/build/src/schema';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {createSelector} from 'reselect';
import {Shelf, ShelfFieldDef, State, toQuery} from '../models';

// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944
// tslint:disable-next-line:no-unused-variable
import {getTopSpecQueryItem, SpecQueryGroup} from 'compassql/build/src/model';
// tslint:disable-next-line:no-unused-variable
import {Query} from 'compassql/build/src/query/query';
// tslint:disable-next-line:no-unused-variable
import {StateWithHistory} from 'redux-undo';
// tslint:disable-next-line:no-unused-variable
import {Selector} from 'reselect/src/reselect';
// tslint:disable-next-line:no-unused-variable
import {BoxPlotDef} from 'vega-lite/build/src/compositemark/boxplot';
// tslint:disable-next-line:no-unused-variable
import {Data, InlineData, NamedData, UrlData} from 'vega-lite/build/src/data';
// tslint:disable-next-line:no-unused-variable
import {EncodingWithFacet} from 'vega-lite/build/src/encoding';
// tslint:disable-next-line:no-unused-variable
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
// tslint:disable-next-line:no-unused-variable
import {MarkDef} from 'vega-lite/build/src/mark';
// tslint:disable-next-line:no-unused-variable
import {FacetedCompositeUnitSpec, GenericUnitSpec} from 'vega-lite/build/src/spec';
// tslint:disable-next-line:no-unused-variable
import {Bookmark} from '../models/bookmark';
// tslint:disable-next-line:no-unused-variable
import {VoyagerConfig} from '../models/config';
// tslint:disable-next-line:no-unused-variable
import {StateBase} from '../models/index';
// tslint:disable-next-line:no-unused-variable
import {PlotObject} from '../models/plot';
import {extractPlotObjects} from '../models/plot';
import {Result} from '../models/result';
import {getTransforms, hasWildcards} from '../models/shelf/spec';



export const selectBookmark = (state: State) => state.present.bookmark;
export const selectConfig = (state: State) => state.present.config;
export const selectData = (state: State) => state.present.dataset.data;
export const selectFilters = (state: State) => state.present.shelf.spec.filters;
export const selectShelf = (state: State) => state.present.shelf;
export const selectSchema = (state: State) => state.present.dataset.schema;

export const selectQuery = createSelector(
  selectShelf,
  (shelf: Shelf) => {
    return toQuery(shelf);
  }
);

const ALL_PRESET_WILDCARD_FIELDS: ShelfFieldDef[] = [
  {field: SHORT_WILDCARD, type: 'quantitative', title: 'Quantitative Fields'},
  {field: SHORT_WILDCARD, type: 'nominal', title: 'Categorical Fields'},
  {field: SHORT_WILDCARD, type: 'temporal', title: 'Temporal Fields'},
];

export const selectPresetWildcardFields = createSelector(
  selectSchema,
  (schema: Schema): ShelfFieldDef[] => {
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
    return schema.fieldSchemas.map(fieldSchema => {
      const {name, vlType} = fieldSchema;
      return {field: name, type: vlType};
    });
  }
);

const selectMainResult = (state: State) => state.present.result.main;

const selectMainSpec = createSelector(
  selectData, selectFilters, selectMainResult,
  (data: Data, filters: Array<RangeFilter|OneOfFilter>, result: Result): FacetedCompositeUnitSpec => {
    if (!result.modelGroup) {
      return;
    }
    return {
      data: data,
      transform: getTransforms(filters),
      ...getTopSpecQueryItem(result.modelGroup).spec
    };
  }
);

export const selectMainResultForView = createSelector(
  selectQuery, selectMainResult, selectMainSpec,
  (query: Query, result: Result, spec: FacetedCompositeUnitSpec): {
    spec: FacetedCompositeUnitSpec,
    plots: PlotObject[]
  } => {
    if (result.isLoading || !result.modelGroup) {
      return;
    }
    if (!hasWildcards(query.spec).hasAnyWildcard) {
      return {
        spec,
        plots: null
      };
    } else {
      return {
        spec: null,
        plots: extractPlotObjects(result.modelGroup)
      };
    }
  }
);
