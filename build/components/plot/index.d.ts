/// <reference types="react" />
import * as React from 'react';
import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { BookmarkAction } from '../../actions/bookmark';
import { ActionHandler } from '../../actions/redux-action';
import { ResultAction } from '../../actions/result';
import { ShelfAction } from '../../actions/shelf';
import { ShelfPreviewAction } from '../../actions/shelf-preview';
import { Bookmark } from '../../models/bookmark';
import { PlotFieldInfo } from '../../models/plot';
export interface PlotProps extends ActionHandler<ShelfAction | BookmarkAction | ShelfPreviewAction | ResultAction> {
    fieldInfos?: PlotFieldInfo[];
    isPlotListItem?: boolean;
    showBookmarkButton?: boolean;
    showSpecifyButton?: boolean;
    spec: FacetedCompositeUnitSpec;
    bookmark?: Bookmark;
    closeModal?: () => void;
}
export interface PlotState {
    hovered: boolean;
    preview: boolean;
    copiedPopupIsOpened: boolean;
}
export declare class PlotBase extends React.PureComponent<PlotProps, PlotState> {
    private hoverTimeoutId;
    private previewTimeoutId;
    private vegaLiteWrapper;
    constructor(props: PlotProps);
    componentDidUpdate(prevProps: PlotProps, prevState: PlotState): void;
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
    private isVerticallyOverFlown(element);
    private vegaLiteWrapperRefHandler;
}
export declare const Plot: typeof PlotBase;
