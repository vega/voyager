/// <reference types="react-dnd" />
/// <reference types="react" />
import { Schema } from 'compassql/build/src/schema';
import * as React from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { FieldOneOfPredicate, FieldRangePredicate } from 'vega-lite/build/src/predicate';
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
    filters: Array<FieldRangePredicate | FieldOneOfPredicate>;
    schema: Schema;
}
export declare const FilterPane: () => React.PureComponent<FilterPanePropsBase, {}>;
