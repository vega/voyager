import {FieldSchema, Schema} from 'compassql/build/src/schema';
export {FieldSchema, Schema} from 'compassql/build/src/schema';

export interface Data {
  name: string;
  schema: Schema;
}

// FIXME: replace this with real data
export const DEFAULT_DATA = {
  name: 'Sample',
  schema: new Schema([{
    field: 'q1',
    type: 'quantitative',
    primitiveType: 'number' as any
  }, {
    field: 'q2',
    type: 'quantitative',
    primitiveType: 'number' as any
  },{
    field: 't',
    type: 'temporal',
    primitiveType: 'date' as any
  }, {
    field: 'n1',
    type: 'nominal',
    primitiveType: 'string' as any
  }, {
    field: 'n2',
    type: 'nominal',
    primitiveType: 'string' as any
  }] as FieldSchema[])
};
