/// <reference types="react-dnd" />
/// <reference types="react" />
import * as React from 'react';
import { DragElementWrapper } from 'react-dnd';
import { FieldParentType } from '../../constants';
import { ShelfFieldDef } from '../../models';
import { ShelfId } from '../../models/shelf';
/**
 * Props for react-dnd of Field
 */
export interface FieldDragSourceProps {
    connectDragSource?: DragElementWrapper<any>;
    isDragging?: boolean;
}
export interface FieldPropsBase {
    fieldDef: ShelfFieldDef;
    isPill: boolean;
    isEnumeratedWildcardField?: boolean;
    parentId?: FieldParentId;
    draggable: boolean;
    /**
     * Add field event handler.  If not provided, add button will disappear.
     */
    onAdd?: (fieldDef: ShelfFieldDef) => void;
    onDoubleClick?: (fieldDef: ShelfFieldDef) => void;
    /** Remove field event handler.  If not provided, remove button will disappear. */
    onRemove?: () => void;
    /** If not provided, it does not have a popup */
    popupComponent?: JSX.Element;
}
export interface FieldProps extends FieldDragSourceProps, FieldPropsBase {
}
export interface FieldState {
    popupIsOpened?: boolean;
}
/**
 * Type and Identifier of Field's parent component
 */
export declare type FieldParentId = {
    type: typeof FieldParentType.ENCODING_SHELF;
    id: ShelfId;
} | {
    type: typeof FieldParentType.FIELD_LIST;
};
export interface DraggedFieldIdentifier {
    fieldDef: ShelfFieldDef;
    parentId: FieldParentId;
}
export declare const Field: () => React.PureComponent<FieldPropsBase, {}>;
