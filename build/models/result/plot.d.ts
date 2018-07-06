import { SpecQueryModelGroup } from 'compassql/build/src/model';
import { NamedData } from 'vega-lite/build/src/data';
import { TopLevelFacetedUnitSpec } from 'vega-lite/build/src/spec';
import { ShelfFieldDef } from '../shelf';
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
export declare function fromSpecQueryModelGroup(modelGroup: SpecQueryModelGroup, data: NamedData): ResultPlotWithKey[];
