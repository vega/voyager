import { Action } from '../actions';
import { Dataset } from '../models';
import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import { Schema } from 'compassql/build/src/schema';
export declare function datasetReducer(dataset: Readonly<Dataset>, action: Action): Dataset;
export declare function schemaReducer(schema: Schema, action: Action): Schema;
export declare function changeFieldType(schema: Schema, field: string, type: ExpandedType): Schema;
export declare function changeOrdinalDomain(schema: Schema, field: string, domain: string[]): Schema;
