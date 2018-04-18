/// <reference types="react" />
import * as React from 'react';
import { DateTime } from 'vega-lite/build/src/datetime';
import { OneOfFilter } from 'vega-lite/build/src/filter';
import { FilterAction } from '../../actions';
export interface OneOfFilterShelfProps {
    domain: string[] | number[] | boolean[] | DateTime[];
    filter: OneOfFilter;
    index: number;
    handleAction: (action: FilterAction) => void;
}
export interface OneOfFilterShelfState {
    hideSearchBar: boolean;
}
export declare class OneOfFilterShelfBase extends React.PureComponent<OneOfFilterShelfProps, OneOfFilterShelfState> {
    constructor(props: OneOfFilterShelfProps);
    render(): JSX.Element;
    protected filterModifyOneOf(index: number, oneOf: string[] | number[] | boolean[] | DateTime[]): void;
    private toggleCheckbox(option);
    private onSelectOne(value);
    private onSelectAll();
    private onClearAll();
    private onClickSearch();
    private onSearch(e);
    /**
     * returns all div nodes in current filter shelf
     */
    private getDivs();
}
export declare const OneOfFilterShelf: typeof OneOfFilterShelfBase;
