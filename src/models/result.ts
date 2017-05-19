import {SpecQueryModelGroup} from 'compassql/build/src/model';


export interface Result {
  isLoading: boolean;

  modelGroup: SpecQueryModelGroup | null;
}

export interface ResultIndex {
  // This is the result of the query from the shelf
  main: Result;

  // TODO: Add other results for other related views in the near future.)
}

export const DEFAULT_RESULT_MAIN: Result = {
  isLoading: false,
  modelGroup: null,
};

export const DEFAULT_RESULT: ResultIndex = {
  main: DEFAULT_RESULT_MAIN
};
