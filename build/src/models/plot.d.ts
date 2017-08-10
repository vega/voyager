import { SpecQueryGroup, SpecQueryModelGroup } from 'compassql/build/src/model';
import { Data } from 'vega-lite/build/src/data';
import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { ShelfFieldDef } from './shelf/encoding';
export interface PlotFieldInfo {
    fieldDef: ShelfFieldDef;
    isEnumeratedWildcardField: boolean;
}
export interface PlotObject {
    fieldInfos: PlotFieldInfo[];
    spec: FacetedCompositeUnitSpec;
}
export declare function extractPlotObjects(modelGroup: SpecQueryGroup<PlotObject>): PlotObject[];
export declare function convertToPlotObjectsGroup(modelGroup: SpecQueryModelGroup, data: Data): SpecQueryGroup<PlotObject>;
