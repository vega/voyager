import {SpecQueryModelGroup} from 'compassql/build/src/model';

export interface Compass {
  isLoading: boolean;

  recommends: SpecQueryModelGroup | null;
}

export const DEFAULT_COMPASS: Compass = {
  isLoading: false,
  recommends: null,
};
