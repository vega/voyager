/// <reference types="react-dnd" />
/// <reference types="react" />
import { Schema } from 'compassql/build/src/schema';
import * as React from 'react';
import { DragElementWrapper } from 'react-dnd';
import { OneOfFilter, RangeFilter } from 'vega-lite/build/src/filter';
import { DatasetSchemaChangeFieldType } from '../../actions/dataset';
import { FilterAction } from '../../actions/filter';
import { ShelfAction } from '../../actions/shelf';
import { FieldParentType } from '../../constants';
import { ShelfId } from '../../models/shelf';
import { ShelfFieldDef } from '../../models/shelf/encoding';
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
    handleAction?: (action: FilterAction | ShelfAction | DatasetSchemaChangeFieldType) => void;
    filterHide?: boolean;
    schema?: Schema;
    /** If not provided, it does not have a popup */
    popupComponent?: JSX.Element;
}
export interface FieldProps extends FieldDragSourceProps, FieldPropsBase {
}
export interface FieldState {
    popupIsOpened: boolean;
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
    filter: RangeFilter | OneOfFilter;
}
export declare const Field: () => React.PureComponent<FieldPropsBase, {}>;
