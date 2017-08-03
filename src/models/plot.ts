import {
  getTopSpecQueryItem,
  isSpecQueryGroup,
  SpecQueryGroup,
  SpecQueryModel,
  SpecQueryModelGroup,
} from 'compassql/build/src/model';
import {FieldQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {toMap} from 'compassql/build/src/util';
import {isWildcard} from 'compassql/build/src/wildcard';
import {Data} from 'vega-lite/build/src/data';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';

import {ShelfFieldDef, ShelfFunction} from './shelf/encoding';

export interface PlotFieldInfo {
  fieldDef: ShelfFieldDef;
  isEnumeratedWildcardField: boolean;
}

export interface PlotObject {
  fieldInfos: PlotFieldInfo[];

  spec: FacetedCompositeUnitSpec;
}

export function extractPlotObjects(modelGroup: SpecQueryGroup<PlotObject>) {
  return modelGroup.items.map(item => {
    if (isSpecQueryGroup<PlotObject>(item)) {
      const childModelGroup = item as SpecQueryGroup<PlotObject>;
      return getTopSpecQueryItem(childModelGroup);
    }
    return item as PlotObject;
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
      return {
        fieldDef: toShelfFieldDef(fieldQ),
        isEnumeratedWildcardField: index in wildcardFieldIndex
      };
    });

  const spec = {
    data,
    ...specQ.toSpec()
  };

  return {fieldInfos, spec};
}

function toShelfFieldDef(fieldQ: FieldQuery): ShelfFieldDef {
  const {aggregate, bin, timeUnit, field, type} = fieldQ;

  if (isWildcard(type)) {
    throw Error('type cannot be a wildcard');
  }

  let fn: ShelfFunction;
  if (bin) {
    fn = 'bin';
  } else if (aggregate) {
    if (isWildcard(aggregate)) {
      throw Error('aggregate cannot be a wildcard (yet)');
    } else {
      fn = aggregate;
    }
  } else if (timeUnit) {
    if (isWildcard(timeUnit)) {
      throw Error('timeUnit cannot be a wildcard (yet)');
    } else {
      fn = timeUnit;
    }
  }

  return {field, type, fn: fn};
}
