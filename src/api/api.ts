
import {Query} from 'compassql/build/src/query/query';
import {recommend} from 'compassql/build/src/recommend';
import {Schema} from 'compassql/build/src/schema';

export function fetchResultRecommends(query: Query, schema: Schema) {
  return new Promise(resolve => {
    // TODO: call server if config indicates remote connection
    resolve(recommend(query, schema).result);
  });
}
