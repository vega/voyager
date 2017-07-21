/// <reference types="react" />
import { Schema } from 'compassql/build/src/schema';
import * as React from 'react';
import { DatasetSchemaChangeFieldType } from '../../actions/dataset';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfFieldAutoAdd } from '../../actions/shelf';
import { ShelfFieldDef } from '../../models/shelf/encoding';
export interface FieldListProps extends ActionHandler<ShelfFieldAutoAdd | DatasetSchemaChangeFieldType> {
    fieldDefs: ShelfFieldDef[];
    schema: Schema;
}
export declare const FieldList: React.ComponentClass<{}>;
export declare const PresetWildcardFieldList: React.ComponentClass<{}>;
