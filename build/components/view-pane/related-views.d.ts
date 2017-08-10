/// <reference types="react" />
import * as React from 'react';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { PlotObject } from '../../models/plot';
import { ResultType } from '../../models/result';
export interface RelatedViewsProps extends ActionHandler<BookmarkAction | ShelfAction> {
    plots: {
        [k in ResultType]: PlotObject[];
    };
    bookmark: Bookmark;
}
export declare class RelatedViewsBase extends React.PureComponent<RelatedViewsProps, {}> {
    render(): JSX.Element;
}
export declare const RelatedViews: React.ComponentClass<{}>;
