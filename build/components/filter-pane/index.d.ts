/// <reference types="react-dnd" />
/// <reference types="react" />
import { Schema } from 'compassql/build/src/schema';
import * as React from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { OneOfFilter, RangeFilter } from 'vega-lite/build/src/filter';
import { FilterAction } from '../../actions';
import { ActionHandler } from '../../actions/redux-action';
/**
 * Props for react-dnd of FilterShelf
 */
export interface FilterPaneDropTargetProps {
    connectDropTarget: ConnectDropTarget;
    isOver: boolean;
    item: Object;
    canDrop: boolean;
}
export interface FilterPanePropsBase extends ActionHandler<FilterAction> {
    filters: Array<RangeFilter | OneOfFilter>;
    schema: Schema;
}
export declare const FilterPane: () => React.PureComponent<FilterPanePropsBase, {}>;
