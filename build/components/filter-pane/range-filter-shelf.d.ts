/// <reference types="react" />
import * as React from 'react';
import { DateTime } from 'vega-lite/build/src/datetime';
import { RangeFilter } from 'vega-lite/build/src/filter';
import { FilterAction } from '../../actions';
import { ActionHandler } from '../../actions/redux-action';
export interface RangeFilterShelfProps extends ActionHandler<FilterAction> {
    domain: number[] | DateTime[];
    index: number;
    filter: RangeFilter;
    renderDateTimePicker: boolean;
}
export interface RangeFilterShelfState {
    minDateTimePickerOpen: boolean;
    maxDateTimePickerOpen: boolean;
}
export declare class RangeFilterShelfBase extends React.PureComponent<RangeFilterShelfProps, RangeFilterShelfState> {
    constructor(props: RangeFilterShelfProps);
    render(): JSX.Element;
    protected filterModifyExtent(input: number[]): void;
    protected filterModifyMaxBound(e: any): void;
    protected filterModifyMinBound(e: any): void;
    private renderNumberInput(bound);
    private renderDateTimePicker(date, bound);
    private focusInput(id);
    private toggleMinDateTimePicker();
    private toggleMaxDateTimePicker();
    /**
     * returns whether to show the time component in the date time picker
     */
    private showTime(timeUnit);
    /**
     * Returns a function to format how the number is displayed in range filter for
     * the given time unit.
     */
    private getFormat(renderDateTime, timeUnit);
    /**
     * Returns the range filter step for the given time unit.
     */
    private getStep(timeUnit);
}
export declare const RangeFilterShelf: typeof RangeFilterShelfBase;
