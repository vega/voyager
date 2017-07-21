/// <reference types="react" />
import * as React from 'react';
import { ActionHandler, ShelfMarkChangeType } from '../../actions';
import { ShelfMark } from '../../models';
export interface MarkPickerProps extends ActionHandler<ShelfMarkChangeType> {
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
