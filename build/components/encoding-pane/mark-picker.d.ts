/// <reference types="react" />
import * as React from 'react';
import { ActionHandler, SpecMarkChangeType } from '../../actions';
import { ShelfMark } from '../../models';
export interface MarkPickerProps extends ActionHandler<SpecMarkChangeType> {
    mark: ShelfMark;
}
/**
 * Control for selecting mark type
 */
export declare class MarkPickerBase extends React.PureComponent<MarkPickerProps, {}> {
    constructor(props: MarkPickerProps);
    render(): JSX.Element;
    private onMarkChange(event);
}
export declare const MarkPicker: typeof MarkPickerBase;
