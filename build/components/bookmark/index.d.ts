/// <reference types="react" />
import * as React from 'react';
import { InlineData } from 'vega-lite/build/src/data';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { Bookmark } from '../../models/bookmark';
export interface BookmarkProps extends ActionHandler<BookmarkAction> {
    bookmark: Bookmark;
    data: InlineData;
}
export declare class BookmarkBase extends React.PureComponent<BookmarkProps, any> {
    constructor(props: BookmarkProps);
    render(): JSX.Element;
    private onExport();
    private onClearAll();
    private openModal();
    private closeModal();
    private renderBookmarks(bookmark);
}
export declare const BookmarkPane: React.ComponentClass<{}>;
