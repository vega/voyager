/// <reference types="react" />
import * as React from 'react';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { Bookmark } from '../../models/bookmark';
import { PlotObject } from '../../models/plot';
export interface BookmarkProps extends ActionHandler<BookmarkAction> {
    bookmark: Bookmark;
    plotObject: PlotObject;
}
export interface BookmarkButtonState {
    openDialog: boolean;
}
export declare class BookmarkButtonBase extends React.PureComponent<BookmarkProps, BookmarkButtonState> {
    constructor(props: BookmarkProps);
    render(): JSX.Element;
    private onKeepBookmark();
    private isBookmarked();
    private onBookmarkClick();
    private onBookmarkRemove();
    private onBookmarkAdd();
}
export declare const BookmarkButton: typeof BookmarkButtonBase;
