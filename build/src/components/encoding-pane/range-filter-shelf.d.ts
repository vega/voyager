/// <reference types="react" />
import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import { RangeFilter } from 'vega-lite/build/src/filter';
import { FilterAction } from '../../actions/filter';
import { ActionHandler } from '../../actions/redux-action';
export interface RangeFilterShelfProps extends ActionHandler<FilterAction> {
    domain: number[];
    index: number;
    filter: RangeFilter;
    type: ExpandedType;
}
export interface RangeFilterShelfState {
    minDateTimePickerOpen: boolean;
    maxDateTimePickerOpen: boolean;
}
export declare class RangeFilterShelfBase extends React.PureComponent<RangeFilterShelfProps, RangeFilterShelfState> {
    constructor(props: RangeFilterShelfProps);
    render(): JSX.Element;
    protected filterModifyExtent(range: number[]): void;
    protected filterModifyMaxBound(e: any): void;
    protected filterModifyMinBound(e: any): void;
    private renderNumberInput(bound);
    private renderDateTimePicker(date, bound);
    private focusInput(id);
    private toggleMinDateTimePicker();
    private toggleMaxDateTimePicker();
    private formatTime;
}
export declare const RangeFilterShelf: typeof RangeFilterShelfBase;
