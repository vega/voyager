import {SpecQueryModel, SpecQueryModelGroup} from 'compassql/build/src/model';
import {FieldQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {toMap} from 'compassql/build/src/util';
import {Data} from 'vega-lite/build/src/data';
import {FacetedUnitSpec} from 'vega-lite/build/src/spec';

import {ShelfFieldDef} from './shelf/encoding';

export interface PlotFieldInfo {
  fieldDef: ShelfFieldDef;
  isEnumeratedWildcardField: boolean;
}

export interface PlotObject {
  fieldInfos: PlotFieldInfo[];

  spec: FacetedUnitSpec;
}

export function plotObjects(modelGroup: SpecQueryModelGroup, data: Data) {
  return modelGroup.items.map(item => {
    // FIXME if (item instanceof SpecQueryModelGroup) {
    if ('getTopSpecQueryModel' in item) {
      const childModelGroup = item as SpecQueryModelGroup;
      return plotObject(data, childModelGroup.getTopSpecQueryModel());
    }
    // FIXME: include data in the main spec?
    return plotObject(data, item as SpecQueryModel);
  });
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
