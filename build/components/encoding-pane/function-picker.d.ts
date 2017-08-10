/// <reference types="react" />
import * as React from 'react';
import { TimeUnit } from 'vega-lite/build/src/timeunit';
import { ShelfFunction } from '../../models/shelf';
import { ShelfFieldDef } from '../../models/shelf/encoding';
export interface FunctionPickerProps {
    fieldDefParts: {
        [k in 'fn' | 'type']?: ShelfFieldDef[k];
    };
    onFunctionChange: (fn: ShelfFunction | TimeUnit) => void;
}
export declare class FunctionPickerBase extends React.PureComponent<FunctionPickerProps, any> {
    constructor(props: FunctionPickerProps);
    render(): JSX.Element;
    private onFunctionChange(event);
}
export declare const FunctionPicker: typeof FunctionPickerBase;
