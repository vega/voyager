/// <reference types="react" />
import * as React from 'react';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { ResultAction } from '../../actions/result';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { PlotObject } from '../../models/plot';
import { Result, ResultType } from '../../models/result';
export interface RelatedViewsProps extends ActionHandler<BookmarkAction | ShelfAction | ResultAction> {
    plots: {
        [k in ResultType]: PlotObject[];
    };
    results: {
        [k in ResultType]: Result;
    };
    bookmark: Bookmark;
}
export declare class RelatedViewsBase extends React.PureComponent<RelatedViewsProps, {}> {
    render(): JSX.Element;
}
export declare const RelatedViews: React.ComponentClass<{}>;
