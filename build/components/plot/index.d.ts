/// <reference types="react" />
import * as React from 'react';
import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { Bookmark } from '../../models/bookmark';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfAction } from '../../actions/shelf';
import { PlotFieldInfo } from '../../models/plot';
export interface PlotProps extends ActionHandler<ShelfAction | BookmarkAction> {
    fieldInfos?: PlotFieldInfo[];
    isPlotListItem?: boolean;
    scrollOnHover?: boolean;
    showBookmarkButton?: boolean;
    showSpecifyButton?: boolean;
    spec: FacetedCompositeUnitSpec;
    bookmark?: Bookmark;
}
export interface PlotState {
    hovered: boolean;
    preview: boolean;
    copiedPopupIsOpened: boolean;
}
export declare class PlotBase extends React.PureComponent<PlotProps, any> {
    private hoverTimeoutId;
    private previewTimeoutId;
    constructor(props: PlotProps);
    render(): JSX.Element;
    protected componentWillUnmount(): void;
    private fields();
    private clearHoverTimeout();
    private clearPreviewTimeout();
    private onMouseEnter();
    private onMouseLeave();
    private onSpecify();
    private onPreviewMouseEnter();
    private onPreviewMouseLeave();
    private specifyButton();
    private bookmarkButton();
    private handleTextChange(event);
    private copySpecButton();
    private copied();
}
export declare const Plot: typeof PlotBase;
