import {Schema} from 'compassql/build/src/schema';
import {Data} from 'vega-lite/build/src/data';
export {FieldSchema, Schema} from 'compassql/build/src/schema';

export interface DatasetWithoutSchema {
  isLoading: boolean;

  name: string;

  data: Data;
}

export interface Dataset extends DatasetWithoutSchema {
  schema: Schema;
}

export const DEFAULT_DATASET: Dataset = {
  isLoading: false,
  name: 'Empty',
  schema: new Schema({fields: []}),
  data: null
};
