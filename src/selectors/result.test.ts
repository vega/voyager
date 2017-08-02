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
import {DEFAULT_STATE, DEFAULT_STATE_WITH_HISTORY, State} from '../models/index';
import {convertToPlotObjectsGroup, extractPlotObjects} from '../models/plot';
import {DEFAULT_RESULT, DEFAULT_RESULT_INDEX} from '../models/result';
import {ShelfAnyEncodingDef, ShelfMark, SpecificEncoding} from '../models/shelf/encoding';
import {DEFAULT_SHELF_SPEC} from '../models/shelf/index';
import {getTransforms} from '../models/shelf/spec';
import {selectMainPlotList, selectMainSpec} from './result';

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
  ...DEFAULT_STATE_WITH_HISTORY,
  present: {
    ...DEFAULT_STATE,
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
};

const stateWildcard: State = {
  ...stateSpecific,
  present: {
    ...stateSpecific.present,
    shelf: {
      ...stateSpecific.present.shelf,
      spec: {
        ...stateSpecific.present.shelf.spec,
        encoding: encodingWildcard
      }
    }
  }
};

describe('selectors/result', () => {
  describe('selectMainSpec', () => {
    it('should return undefined', () => {
      expect(selectMainSpec(DEFAULT_STATE_WITH_HISTORY)).toBe(undefined);
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
      expect(selectMainPlotList(DEFAULT_STATE_WITH_HISTORY)).toBe(undefined);
    });

    it('should return a main plot list', () => {
      expect(selectMainPlotList(stateWildcard)).toEqual(
        extractPlotObjects(modelGroup, filters)
      );
    });
  });
});
