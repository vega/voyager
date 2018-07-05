import {
  SpecQueryModel,
  SpecQueryModelGroup,
} from 'compassql/build/src/model';
import {FieldQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {ExtendedGroupBy} from 'compassql/build/src/query/groupby';
import {getTopResultTreeItem, isResultTree} from 'compassql/build/src/result';
import {toMap} from 'compassql/build/src/util';
import {NamedData} from 'vega-lite/build/src/data';
import {TopLevelFacetedUnitSpec} from 'vega-lite/build/src/spec';
import {fromFieldQuery, ShelfFieldDef} from '../shelf';

export interface PlotFieldInfo {
  fieldDef: ShelfFieldDef;
  isEnumeratedWildcardField: boolean;
}

export interface ResultPlot {
  fieldInfos: PlotFieldInfo[];

  spec: TopLevelFacetedUnitSpec;
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
    if (isResultTree<SpecQueryModel>(item)) {
      return plotWithKey(data, getTopResultTreeItem(item), modelGroup.groupBy);
    }
    return plotWithKey(data, item as SpecQueryModel, modelGroup.groupBy);
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

  // FIXME: Hack to convert FacetedUnitSpec to ToplevelFactedUnitSpec
  const spec: TopLevelFacetedUnitSpec = {
    data,
    ...specQ.toSpec() as TopLevelFacetedUnitSpec
  };

  const groupByKey = specQ.toShorthand(groupBy);

  return {plot: {fieldInfos, spec}, groupByKey};
}
