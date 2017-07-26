import { Schema } from 'compassql/build/src/schema';
export { FieldSchema, Schema } from 'compassql/build/src/schema';
import { Data } from 'vega-lite/build/src/data';
export interface Dataset {
    isLoading: boolean;
    name: string;
    schema: Schema;
    data: Data;
}
export declare const DEFAULT_DATASET: Dataset;
