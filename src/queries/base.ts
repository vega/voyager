import {Query} from 'compassql/build/src/query/query';
import {ResultType} from '../models/result';

export interface QueryCreator {
  type: ResultType;

  title: string;


  filterSpecifiedView: boolean;

  createQuery(query: Query): Query;
}
