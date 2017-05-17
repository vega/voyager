import {SpecQueryModelGroup} from 'compassql/build/src/model';
import {FieldSchema, Schema} from 'compassql/build/src/schema';
export {FieldSchema, Schema} from 'compassql/build/src/schema';

import {Data} from 'vega-lite/build/src/data';

export interface Dataset {
  isLoading: boolean;

  name: string;
  schema: Schema;

  data: Data;
  recommends: SpecQueryModelGroup;
}

// FIXME: replace this with real data
export const DEFAULT_DATASET: Dataset = {
  isLoading: false,

  name: 'Sample',
  schema: new Schema([{
    field: 'q1',
    type: 'quantitative',
    primitiveType: 'number' as any,
    stats: {
      distinct: 2
    }
  }, {
    field: 'q2',
    type: 'quantitative',
    primitiveType: 'number' as any,
    stats: {
      distinct: 2
    }
  }, {
    field: 't',
    type: 'temporal',
    primitiveType: 'date' as any,
    stats: {
      distinct: 2
    }
  }, {
    field: 'n1',
    type: 'nominal',
    primitiveType: 'string' as any,
    stats: {
      distinct: 2
    }
  }, {
    field: 'n2',
    type: 'nominal',
    primitiveType: 'string' as any,
    stats: {
      distinct: 2
    }
  }] as FieldSchema[]),

  data: {
    values: [
      {q1: 1, q2: 2, t: new Date(), n1: 'a', n2: 1},
      {q1: 100, q2: 23, t: new Date(), n1: 'c', n2: 1}
    ]
  },

  recommends: {} as SpecQueryModelGroup
};
