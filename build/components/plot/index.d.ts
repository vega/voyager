/// <reference types="react" />
import * as React from 'react';
import { SortField, SortOrder } from 'vega-lite/build/src/sort';
import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { BookmarkAction } from '../../actions/bookmark';
import { LogAction } from '../../actions/log';
import { ActionHandler } from '../../actions/redux-action';
import { ResultAction } from '../../actions/result';
import { ShelfAction } from '../../actions/shelf';
import { ShelfPreviewAction } from '../../actions/shelf-preview';
import { Bookmark } from '../../models/bookmark';
import { PlotFieldInfo } from '../../models/result';
export interface PlotProps extends ActionHandler<ShelfAction | BookmarkAction | ShelfPreviewAction | ResultAction | LogAction> {
    fieldInfos?: PlotFieldInfo[];
    isPlotListItem?: boolean;
    showBookmarkButton?: boolean;
    showSpecifyButton?: boolean;
    onSort?: (channel: 'x' | 'y', sort: SortField | SortOrder) => void;
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
    private plotLogger;
    constructor(props: PlotProps);
    componentDidUpdate(prevProps: PlotProps, prevState: PlotState): void;
    render(): JSX.Element;
    protected componentWillUnmount(): void;
    private fields();
    private clearHoverTimeout();
    private clearPreviewTimeout();
    private onMouseEnter();
    private onMouseLeave();
    private onSort(channel);
    private onSpecify();
    private onPreviewMouseEnter();
    private onPreviewMouseLeave();
    private sortButton(channel);
    private specifyButton();
    private bookmarkButton();
    private handleTextChange(event);
    private copySpecButton();
    private copied();
    private isVerticallyOverFlown(element);
    private vegaLiteWrapperRefHandler;
}
export declare const Plot: typeof PlotBase;
