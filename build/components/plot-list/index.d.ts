/// <reference types="react" />
import * as React from 'react';
import { ActionHandler } from '../../actions/redux-action';
import { ResultAction } from '../../actions/result';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { PlotObject } from '../../models/plot';
import { ResultType } from '../../models/result';
export interface PlotListProps extends ActionHandler<ShelfAction | ResultAction> {
    plots: PlotObject[];
    resultType?: ResultType;
    bookmark: Bookmark;
    limit?: number;
}
export declare class PlotListBase extends React.PureComponent<PlotListProps, any> {
    constructor(props: PlotListProps);
    render(): JSX.Element;
    private handleLoadMore();
}
export declare const PlotList: typeof PlotListBase;
