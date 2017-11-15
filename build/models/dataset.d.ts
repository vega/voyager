import { Schema } from 'compassql/build/src/schema';
import { InlineData } from 'vega-lite/build/src/data';
export { FieldSchema, Schema } from 'compassql/build/src/schema';
export interface DatasetWithoutSchema {
    isLoading: boolean;
    name: string;
    data: InlineData;
}
export interface Dataset extends DatasetWithoutSchema {
    schema: Schema;
}
export declare const DEFAULT_DATASET: Dataset;
