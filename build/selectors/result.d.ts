import { BoxPlotDef } from 'vega-lite/build/src/compositemark/boxplot';
import { EncodingWithFacet } from 'vega-lite/build/src/encoding';
import { MarkDef } from 'vega-lite/build/src/mark';
import { GenericUnitSpec } from 'vega-lite/build/src/spec';
import { GenericState, UndoableStateBase } from '../models/index';
import { Selector } from 'reselect/src/reselect';
import { State } from '../models/index';
import { Result, ResultType } from '../models/result';
export declare const selectResult: {
    [k in ResultType]?: Selector<State, Result>;
};
export declare const selectResultLimit: {
    [k in ResultType]?: Selector<State, number>;
};
export declare const selectMainSpec: Selector<GenericState<UndoableStateBase>, GenericUnitSpec<EncodingWithFacet<string | {
    repeat: "row" | "column";
}>, "area" | "circle" | "line" | "rect" | "text" | "square" | "point" | "box-plot" | "bar" | "tick" | "rule" | MarkDef | "error-bar" | BoxPlotDef>>;
