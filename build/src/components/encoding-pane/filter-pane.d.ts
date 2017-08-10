/// <reference types="react-dnd" />
/// <reference types="react" />
import { Schema } from 'compassql/build/src/schema';
import * as React from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { OneOfFilter, RangeFilter } from 'vega-lite/build/src/filter';
import { FilterAction } from '../../actions/filter';
/**
 * Props for react-dnd of FilterShelf
 */
export interface FilterPaneDropTargetProps {
    connectDropTarget: ConnectDropTarget;
    isOver: boolean;
    item: Object;
}
export interface FilterPanePropsBase {
    filters: Array<RangeFilter | OneOfFilter>;
    schema: Schema;
    handleAction?: (action: FilterAction) => void;
}
export declare const FilterPane: () => React.PureComponent<FilterPanePropsBase, {}>;
