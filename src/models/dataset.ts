import {Schema} from 'compassql/build/src/schema';
import {Data} from 'vega-lite/build/src/data';

export {FieldSchema, Schema} from 'compassql/build/src/schema';

export interface Dataset {
  isLoading: boolean;

  name: string;
  schema: Schema;

  data: Data;
}

export const DEFAULT_DATASET: Dataset = {
  isLoading: false,
  name: 'Empty',
  schema: new Schema({fields: []}),
  data: null
};

