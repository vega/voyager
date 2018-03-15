/// <reference types="react" />
import * as React from 'react';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { ResultAction } from '../../actions/result';
import { ShelfAction } from '../../actions/shelf';
import { ShelfPreviewAction } from '../../actions/shelf-preview';
import { Bookmark } from '../../models/bookmark';
import { Result, ResultType } from '../../models/result';
export interface RelatedViewsProps extends ActionHandler<BookmarkAction | ShelfAction | ShelfPreviewAction | ResultAction> {
    results: {
        [k in ResultType]: Result;
    };
    bookmark: Bookmark;
}
export declare class RelatedViewsBase extends React.PureComponent<RelatedViewsProps, {}> {
    render(): JSX.Element;
    private onSpecify(relatedViewType);
    private onPreviewMouseEnter(relatedViewType);
    private onPreviewMouseLeave(relatedViewType);
}
export declare const RelatedViews: React.ComponentClass<{}>;
