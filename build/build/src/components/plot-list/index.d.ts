/// <reference types="react" />
import * as React from 'react';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { PlotObject } from '../../models/plot';
export interface PlotListProps extends ActionHandler<ShelfAction> {
    plots: PlotObject[];
    bookmark: Bookmark;
}
export declare class PlotListBase extends React.PureComponent<PlotListProps, any> {
    render(): JSX.Element;
}
export declare const PlotList: typeof PlotListBase;
