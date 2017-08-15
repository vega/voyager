import {
  getTopSpecQueryItem,
  isSpecQueryGroup,
  SpecQueryModel,
  SpecQueryModelGroup,
} from 'compassql/build/src/model';
import {FieldQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {ExtendedGroupBy} from 'compassql/build/src/query/groupby';
import {toMap} from 'compassql/build/src/util';
import {Data} from 'vega-lite/build/src/data';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {fromFieldQuery} from './shelf';
import {ShelfFieldDef} from './shelf/encoding';

export interface PlotFieldInfo {
  fieldDef: ShelfFieldDef;
  isEnumeratedWildcardField: boolean;
}

export interface PlotObject {
  fieldInfos: PlotFieldInfo[];

  spec: FacetedCompositeUnitSpec;
}


// TODO: rename to from SpecQueryModelGroup
export function convertToPlotList(
  modelGroup: SpecQueryModelGroup,
  data: Data
): PlotObject[] {
  return modelGroup.items.map(item => {
    if (isSpecQueryGroup<SpecQueryModel>(item)) {
      const childModelGroup = item as SpecQueryModelGroup;
      return plotObject(data, getTopSpecQueryItem(childModelGroup), modelGroup.groupBy);
    }
    // FIXME: include data in the main spec?
    return plotObject(data, item as SpecQueryModel, modelGroup.groupBy);
  });
}

// FIXME: include data in the main query?
function plotObject(data: Data, specQ: SpecQueryModel, groupBy: string | Array<string|ExtendedGroupBy>): PlotObject {

  const wildcardFieldIndex = toMap(specQ.wildcardIndex.encodingIndicesByProperty.get('field') || []);

  const fieldInfos: PlotFieldInfo[] = specQ.getEncodings()
    .filter(isFieldQuery)
    .map((fieldQ: FieldQuery, index): PlotFieldInfo => {
      return {
        fieldDef: fromFieldQuery(fieldQ),
        isEnumeratedWildcardField: index in wildcardFieldIndex
      };
    });

  const spec = {
    data,
    ...specQ.toSpec()
  };

  return {fieldInfos, spec};
}
