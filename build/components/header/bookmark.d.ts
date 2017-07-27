/// <reference types="react" />
import * as React from 'react';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { Bookmark } from '../../models/bookmark';
export interface BookmarkProps extends ActionHandler<BookmarkAction> {
    bookmark: Bookmark;
}
export declare class BookmarkBase extends React.PureComponent<BookmarkProps, any> {
    constructor(props: BookmarkProps);
    render(): JSX.Element;
    private openModal();
    private closeModal();
    private renderBookmarks(bookmark);
}
export declare const BookmarkPane: React.ComponentClass<{}>;
