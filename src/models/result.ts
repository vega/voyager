import {SpecQueryGroup} from 'compassql/build/src/model';
import {PlotObject} from '../models/plot';


export interface Result {
  isLoading: boolean;

  modelGroup: SpecQueryGroup<PlotObject> | null;
}

export interface ResultIndex {
  // This is the result of the query from the shelf
  main: Result;

  addCategoricalField: Result;
  addQuantitativeField: Result;
  addTemporalField: Result;
  alternativeEncodings: Result;
  histograms: Result;
  summaries: Result;
}

export const DEFAULT_RESULT: Result = {
  isLoading: false,
  modelGroup: null,
};

export const DEFAULT_RESULT_INDEX: ResultIndex = {
  main: DEFAULT_RESULT,
  addCategoricalField: DEFAULT_RESULT,
  addQuantitativeField: DEFAULT_RESULT,
  addTemporalField: DEFAULT_RESULT,
  alternativeEncodings: DEFAULT_RESULT,
  histograms: DEFAULT_RESULT,
  summaries: DEFAULT_RESULT
};

export type ResultType = keyof ResultIndex;

export const RESULT_TYPES: ResultType[] =
  // Need to cast as keys return string[] by default
  Object.keys(DEFAULT_RESULT_INDEX) as ResultType[];
