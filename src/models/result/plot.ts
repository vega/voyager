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
import {fromFieldQuery} from '../shelf';
import {ShelfFieldDef} from '../shelf/encoding';

export interface PlotFieldInfo {
  fieldDef: ShelfFieldDef;
  isEnumeratedWildcardField: boolean;
}

export interface PlotObject {
  fieldInfos: PlotFieldInfo[];

  spec: FacetedCompositeUnitSpec;
}

export interface PlotObjectWithKey {
  plot: PlotObject;
  groupByKey: string;
}


// TODO: rename to from SpecQueryModelGroup
export function convertToPlotListWithKey(
  modelGroup: SpecQueryModelGroup,
  data: Data
): PlotObjectWithKey[] {
  return modelGroup.items.map(item => {
    if (isSpecQueryGroup<SpecQueryModel>(item)) {
      const childModelGroup = item as SpecQueryModelGroup;
      return plotObjectWithKey(data, getTopSpecQueryItem(childModelGroup), modelGroup.groupBy);
    }
    return plotObjectWithKey(data, item, modelGroup.groupBy);
  });
}

function plotObjectWithKey(
  data: Data, specQ: SpecQueryModel, groupBy: string | Array<string|ExtendedGroupBy>
): PlotObjectWithKey {

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

  const groupByKey = specQ.toShorthand(groupBy);

  return {plot: {fieldInfos, spec}, groupByKey};
}
