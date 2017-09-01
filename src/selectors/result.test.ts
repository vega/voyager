import {DEFAULT_QUERY_CONFIG} from 'compassql/build/src/config';
import {SpecQueryModel} from 'compassql/build/src/model';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Schema} from 'compassql/build/src/schema';
import {Data} from 'vega-lite/build/src/data';
import {DEFAULT_DATASET} from '../models/dataset';
import {DEFAULT_PERSISTENT_STATE, DEFAULT_STATE, State} from '../models/index';
import {fromSpecQueryModelGroup} from '../models/result';
import {DEFAULT_RESULT, DEFAULT_RESULT_INDEX} from '../models/result';
import {DEFAULT_SHELF} from '../models/shelf/index';
import {ShelfUnitSpec, toSpecQuery} from '../models/shelf/spec/index';
import {selectMainSpec} from './result';

function buildSpecQueryModel(specQ: SpecQuery) {
  return SpecQueryModel.build(specQ, new Schema({fields: []}), DEFAULT_QUERY_CONFIG);
}

function buildSpecQueryModelGroup(specQs: SpecQuery[]) {
  const items = specQs.map(specQ => buildSpecQueryModel(specQ));
  return {
    name: 'a name',
    path: 'path',
    items: items,
  };
}

const data: Data = {
  url: 'a/data/set.csv'
};

const spec: ShelfUnitSpec = {
  mark: 'point',
  encoding: {
    y: {field: 'q1', type: ExpandedType.TEMPORAL}
  },
  anyEncodings: [],
  config: {numberFormat: 'd'}
};

const group = buildSpecQueryModelGroup([toSpecQuery(spec)]);

const plots = fromSpecQueryModelGroup(group, data).map(p => p.plot);

const stateSpecific: State = {
  persistent: DEFAULT_PERSISTENT_STATE,
  undoable: {
    ...DEFAULT_STATE.undoable,
    present: {
      ...DEFAULT_STATE.undoable.present,
      dataset: {
        ...DEFAULT_DATASET,
        data
      },
      shelf: {
        ...DEFAULT_SHELF,
        spec
      },
      result: {
        ...DEFAULT_RESULT_INDEX,
        main: {
          ...DEFAULT_RESULT,
          plots
        }
      }
    }
  }
};

describe('selectors/result', () => {
  describe('selectMainSpec', () => {
    it('should return undefined', () => {
      expect(selectMainSpec(DEFAULT_STATE)).toBe(undefined);
    });

    it('should return a main spec', () => {
      expect(selectMainSpec(stateSpecific)).toEqual(plots[0].spec);
    });
  });
});
