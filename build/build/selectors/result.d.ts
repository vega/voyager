import { Selector } from 'reselect/src/reselect';
import { BoxPlotDef } from 'vega-lite/build/src/compositemark/boxplot';
import { EncodingWithFacet } from 'vega-lite/build/src/encoding';
import { MarkDef } from 'vega-lite/build/src/mark';
import { GenericUnitSpec } from 'vega-lite/build/src/spec';
import { State } from '../models/index';
import { PlotObject } from '../models/plot';
import { Result, ResultType } from '../models/result';
export declare const selectResult: {
    [k in ResultType]?: Selector<State, Result>;
};
export declare const selectMainSpec: Selector<State, GenericUnitSpec<EncodingWithFacet<string | {
    repeat: "row" | "column";
}>, "area" | "circle" | "line" | "rect" | "text" | "box-plot" | "error-bar" | BoxPlotDef | "bar" | "point" | "tick" | "rule" | "square" | MarkDef>>;
export declare const selectPlotList: {
    [k in ResultType]?: Selector<State, PlotObject[]>;
};
