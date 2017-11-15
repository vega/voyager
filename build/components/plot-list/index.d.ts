/// <reference types="react" />
import * as React from 'react';
import { InlineData } from 'vega-lite/build/src/data';
import { ActionHandler } from '../../actions/redux-action';
import { ResultAction } from '../../actions/result';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { ResultType } from '../../models/result';
import { Result } from '../../models/result/index';
import { ShelfFilter } from '../../models/shelf/filter';
export interface PlotListOwnProps extends ActionHandler<ShelfAction | ResultAction> {
    result: Result;
    resultType?: ResultType;
    bookmark: Bookmark;
}
export interface PlotListConnectProps {
    data: InlineData;
    filters: ShelfFilter[];
}
export declare type PlotListProps = PlotListOwnProps & PlotListConnectProps;
export declare class PlotListBase extends React.PureComponent<PlotListProps, any> {
    constructor(props: PlotListProps);
    render(): JSX.Element;
    private onPlotSort(index, channel, value);
    private onLoadMore();
}
export declare const PlotList: React.ComponentClass<PlotListOwnProps>;
