import {Query} from 'compassql/build/src/query/query';
import {GroupBy} from 'compassql/src/query/groupby';
import {ResultType} from '../actions/result';

export interface QueryCreator {
  type: ResultType;

  title: string;

  /**
   * Group by for generating abstract key for filtering the main query from the related view results.
   */
  filterGroupBy: GroupBy;

  createQuery(query: Query): Query;
}
