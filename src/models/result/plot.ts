import {
  getTopSpecQueryItem,
  isSpecQueryGroup,
  SpecQueryModel,
  SpecQueryModelGroup,
} from 'compassql/build/src/model';
import {FieldQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {ExtendedGroupBy} from 'compassql/build/src/query/groupby';
import {toMap} from 'compassql/build/src/util';
import {NamedData} from 'vega-lite/build/src/data';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {fromFieldQuery, ShelfFieldDef} from '../shelf';

export interface PlotFieldInfo {
  fieldDef: ShelfFieldDef;
  isEnumeratedWildcardField: boolean;
}

export interface ResultPlot {
  fieldInfos: PlotFieldInfo[];

  spec: FacetedCompositeUnitSpec;
}

export interface ResultPlotWithKey {
  plot: ResultPlot;
  groupByKey: string;
}

export function fromSpecQueryModelGroup(
  modelGroup: SpecQueryModelGroup,
  data: NamedData
): ResultPlotWithKey[] {
  return modelGroup.items.map(item => {
    if (isSpecQueryGroup<SpecQueryModel>(item)) {
      const childModelGroup = item as SpecQueryModelGroup;
      return plotWithKey(data, getTopSpecQueryItem(childModelGroup), modelGroup.groupBy);
    }
    return plotWithKey(data, item, modelGroup.groupBy);
  });
}

function plotWithKey(
  data: NamedData,
  specQ: SpecQueryModel,
  groupBy: string | Array<string|ExtendedGroupBy>
): ResultPlotWithKey {

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
