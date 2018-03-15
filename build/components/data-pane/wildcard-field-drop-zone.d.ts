/// <reference types="react-dnd" />
/// <reference types="react" />
import { Schema } from 'compassql/build/src/schema';
import * as React from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { CustomWildcardAction } from '../../actions/custom-wildcard-field';
import { ActionHandler } from '../../actions/redux-action';
export interface CustomWildcardFieldDropZoneDropTargetProps {
    connectDropTarget: ConnectDropTarget;
    isOver: boolean;
    item: Object;
    canDrop: boolean;
}
export interface CustomWildcardFieldDropZonePropsBase extends ActionHandler<CustomWildcardAction> {
    schema: Schema;
}
export declare const CustomWildcardFieldDropZone: () => React.PureComponent<CustomWildcardFieldDropZonePropsBase, {}>;
