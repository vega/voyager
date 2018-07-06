/// <reference types="react" />
import { Schema } from 'compassql/build/src/schema';
import * as React from 'react';
import { FieldOneOfPredicate, FieldRangePredicate } from 'vega-lite/build/src/predicate';
import { FilterAction } from '../../actions';
import { DatasetSchemaChangeFieldType } from '../../actions/dataset';
import { ActionHandler } from '../../actions/redux-action';
import { SpecFieldAutoAdd } from '../../actions/shelf';
import { VoyagerConfig } from '../../models/config';
import { ShelfFieldDef } from '../../models/shelf';
export interface FieldListProps extends ActionHandler<SpecFieldAutoAdd | DatasetSchemaChangeFieldType | FilterAction> {
    config: VoyagerConfig;
    fieldDefs: ShelfFieldDef[];
    schema: Schema;
    filters: Array<FieldRangePredicate | FieldOneOfPredicate>;
}
export declare const FieldList: React.ComponentClass<{}>;
export declare const PresetWildcardFieldList: React.ComponentClass<{}>;
