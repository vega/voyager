import {FieldSchema, Schema} from 'compassql/build/src/schema';
export {FieldSchema, Schema} from 'compassql/build/src/schema';

export interface Dataset {
  name: string;
  schema: Schema;
}

// FIXME: replace this with real data
export const DEFAULT_DATASET = {
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
  },{
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
  }] as FieldSchema[])
};
