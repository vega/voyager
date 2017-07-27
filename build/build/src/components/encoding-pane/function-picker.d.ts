/// <reference types="react" />
import * as React from 'react';
import { ShelfFieldDef, ShelfFunction } from '../../models/shelf';
export interface FunctionPickerProps {
    fieldDef: ShelfFieldDef;
    onFunctionChange: (fn: ShelfFunction) => void;
}
export declare class FunctionPickerBase extends React.PureComponent<FunctionPickerProps, any> {
    constructor(props: FunctionPickerProps);
    render(): JSX.Element;
    private onFunctionChange(event);
}
export declare const FunctionPicker: typeof FunctionPickerBase;
