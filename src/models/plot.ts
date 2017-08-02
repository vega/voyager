import {
  getTopSpecQueryItem,
  isSpecQueryGroup,
  SpecQueryGroup,
  SpecQueryModel,
  SpecQueryModelGroup,
} from 'compassql/build/src/model';
import {FieldQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {toMap} from 'compassql/build/src/util';
import {Data} from 'vega-lite/build/src/data';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {ShelfFieldDef} from './shelf/encoding';
import {getTransforms} from './shelf/spec';

export interface PlotFieldInfo {
  fieldDef: ShelfFieldDef;
  isEnumeratedWildcardField: boolean;
}

export interface PlotObject {
  fieldInfos: PlotFieldInfo[];

  spec: FacetedCompositeUnitSpec;
}

export function extractPlotObjects(modelGroup: SpecQueryGroup<PlotObject>,
                                   filters: Array<RangeFilter|OneOfFilter>): PlotObject[] {
  return modelGroup.items.map(item => {
    if (isSpecQueryGroup<PlotObject>(item)) {
      const childModelGroup = item as SpecQueryGroup<PlotObject>;
      return {
        ...getTopSpecQueryItem(childModelGroup),
        spec: {
          ...getTopSpecQueryItem(childModelGroup).spec,
          transform: getTransforms(filters)
        }
      };
    }
    return {
      ...item,
      spec: {
        ...item.spec,
        transform: getTransforms(filters)
      }
    };
  });
}

export function convertToPlotObjectsGroup(
  modelGroup: SpecQueryModelGroup,
  data: Data
): SpecQueryGroup<PlotObject> {
  const items = modelGroup.items.map(item => {
    if (isSpecQueryGroup<SpecQueryModel>(item)) {
      const childModelGroup = item as SpecQueryModelGroup;
      return plotObject(data, getTopSpecQueryItem(childModelGroup));
    }
    // FIXME: include data in the main spec?
    return plotObject(data, item as SpecQueryModel);
  });

  return {
    name: modelGroup.name,
    path: modelGroup.path,
    items: items,
    groupBy: modelGroup.groupBy,
    orderGroupBy: modelGroup.orderGroupBy,
  };
}

// FIXME: include data in the main query?
function plotObject(data: Data, specQ: SpecQueryModel): PlotObject {

  const wildcardFieldIndex = toMap(specQ.wildcardIndex.encodingIndicesByProperty.get('field') || []);
  const fieldInfos: PlotFieldInfo[] = specQ.getEncodings()
    .filter(isFieldQuery)
    .map((fieldQ: FieldQuery, index): PlotFieldInfo => {
      const {aggregate, field, timeUnit, hasFn, bin, type} = fieldQ;
      // HACK not all properties are compatible
      return {
        fieldDef: {aggregate, field, timeUnit, hasFn, bin, type} as ShelfFieldDef,
        isEnumeratedWildcardField: index in wildcardFieldIndex
      };
    });

  const spec = {
    data,
    ...specQ.toSpec()
  };

  return {fieldInfos, spec};
}
