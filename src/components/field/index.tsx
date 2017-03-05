import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DragElementWrapper, DragSource, DragSourceCollector, DragSourceSpec} from 'react-dnd';

import * as styles from './field.scss';

import {Type} from 'vega-lite/build/src/type';
import {DraggableType, FieldParentType} from '../../constants';
import {ShelfFieldDef} from '../../models';
import {ShelfId} from '../../models/shelf';

/**
 * Props for react-dnd of Field
 */
export interface FieldDragSourceProps {
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDragSource?: DragElementWrapper<any>;

  // You can ask the monitor about the current drag state:
  isDragging?: boolean;
}

export interface FieldProps extends FieldDragSourceProps {
  fieldDef: ShelfFieldDef;

  isPill: boolean;

  caret?: boolean;

  parentId?: FieldParentId;

  draggable: boolean;

  /** Remove field event handler.  If not provided, remove button will not be shown. */
  onRemove?: () => void;
};

class FieldBase extends React.PureComponent<FieldProps, {}> {
  constructor(props: FieldProps) {
    super(props);
  }

  public render(): JSX.Element {
    const {caret, connectDragSource, fieldDef, isPill, onRemove} = this.props;
    const {field} = fieldDef;

    const component = (
      <span styleName={isPill ? 'field-pill' : 'field'}>
        {typeSpan(caret, fieldDef.type)}
        <span styleName="text">
          {field}
        </span>
        {this.removeSpan(onRemove)}
      </span>
    );

    // Wrap with connect dragSource if it is injected
    return connectDragSource ? connectDragSource(component) : component;
  }

  private removeSpan(onRemove: () => void) {
    return onRemove && (
      <span><a onClick={onRemove}><i className="fa fa-times"/></a></span>
    );
  }
};

const TYPE_NAMES = {
  nominal: 'text',
  ordinal: 'text-ordinal',
  quantitative: 'number',
  temporal: 'time',
  geographic: 'geo'
};

const TYPE_ICONS = {
  nominal: 'fa-font',
  ordinal: 'fa-font',
  quantitative: 'fa-hashtag',
  temporal: 'fa-calendar',
};


function typeSpan(caret: boolean, type?: Type) {
  const icon = TYPE_ICONS[type];
  const title = TYPE_NAMES[type];

  return <span styleName="type-caret">
    {caret && <i className="fa fa-caret-down"/>}
    {type && <i className={'fa ' + icon} styleName="type" title={title}/>}
  </span>;
}

/**
 * Type and Identifier of Field's parent component
 */
export type FieldParentId = {
  type: typeof FieldParentType.ENCODING_SHELF,
  id: ShelfId
} | {
  type: typeof FieldParentType.FIELD_LIST
};

export interface DraggedFieldIdentifier {
  fieldDef: ShelfFieldDef;
  parentId: FieldParentId;
}

const fieldSource: DragSourceSpec<FieldProps> = {
  beginDrag(props): DraggedFieldIdentifier {
    const {fieldDef, parentId} = props;
    return {fieldDef, parentId};
  }
};

/**
 * Specifies which props to inject into your component.
 */
const collect: DragSourceCollector = (connect, monitor): FieldDragSourceProps => {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),

    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging()
  };
};

export const Field = DragSource(DraggableType.FIELD, fieldSource, collect)(
  CSSModules(FieldBase, styles)
);
