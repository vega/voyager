import {DEFAULT_QUERY_CONFIG} from 'compassql/build/src/config';
import {getTopSpecQueryItem, SpecQueryModel} from 'compassql/build/src/model';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Schema} from 'compassql/build/src/schema';
import {Channel} from 'vega-lite/build/src/channel';
import {Data} from 'vega-lite/build/src/data';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {Mark} from 'vega-lite/build/src/mark';
import {DEFAULT_DATASET} from '../models/dataset';
import {DEFAULT_PERSISTENT_STATE, DEFAULT_STATE, State} from '../models/index';
import {convertToPlotObjectsGroup, extractPlotObjects} from '../models/plot';
import {DEFAULT_RESULT, DEFAULT_RESULT_INDEX} from '../models/result';
import {ShelfAnyEncodingDef, ShelfMark, SpecificEncoding} from '../models/shelf/encoding';
import {DEFAULT_SHELF_SPEC} from '../models/shelf/index';
import {getTransforms} from '../models/shelf/spec';
import {selectMainSpec, selectPlotList} from './result';

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

const filters: Array<RangeFilter|OneOfFilter> = [{field: 'q1', range: [0, 1]}];

const mark: ShelfMark = 'point';

const encodingWildcard: SpecificEncoding = {
  x: {field: '?', type: ExpandedType.QUANTITATIVE}
};

const encodingSpecific: SpecificEncoding = {
  y: {field: 'q1', type: ExpandedType.TEMPORAL}
};

const group = buildSpecQueryModelGroup([
  {
    mark: Mark.BAR,
    encodings: [
      {channel: Channel.X}
    ]
  }
]);

const modelGroup = convertToPlotObjectsGroup(group, data);

const stateSpecific: State = {
  persistent: DEFAULT_PERSISTENT_STATE,
  undoable: {
    ...DEFAULT_STATE.undoable, // maybe i can't use spread and i have to type it all out manually :(
    present: {
      ...DEFAULT_STATE.undoable.present,
      dataset: {
        ...DEFAULT_DATASET,
        data
      },
      shelf: {
        ...DEFAULT_SHELF_SPEC,
        spec: {
          filters,
          mark,
          encoding: encodingSpecific,
          anyEncodings: [] as ShelfAnyEncodingDef[],
          config: {numberFormat: 'd'}
        }
      },
      result: {
        ...DEFAULT_RESULT_INDEX,
        main: {
          ...DEFAULT_RESULT,
          modelGroup
        }
      }
    }
  }
};


const stateWildcard: State = {
  persistent: DEFAULT_PERSISTENT_STATE,
  undoable: {
    ...DEFAULT_STATE.undoable,
    present: {
      ...stateSpecific.undoable.present,
      shelf: {
        ...stateSpecific.undoable.present.shelf,
        spec: {
          ...stateSpecific.undoable.present.shelf.spec,
          encoding: encodingWildcard
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
      expect(selectMainSpec(stateSpecific)).toEqual({
        data,
        transform: getTransforms(filters),
        ...getTopSpecQueryItem(modelGroup).spec
      });
    });
  });

  describe('selectMainPlotList', () => {
    it('should return undefined', () => {
      expect(selectPlotList.main(DEFAULT_STATE)).toBe(undefined);
    });

    it('should return a main plot list', () => {
      expect(selectPlotList.main(stateWildcard)).toEqual(
        extractPlotObjects(modelGroup, filters)
      );
    });
  });
});
