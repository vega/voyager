import * as React from 'react';
import {DragElementWrapper, DragSource, DragSourceCollector, DragSourceSpec} from 'react-dnd';

import {DraggableType} from '../../constants';
import {ShelfFieldDef} from '../../models';

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

  draggable: boolean;

  /** Remove field event handler.  If not provided, remove button will not be shown. */
  onRemove?: () => void;
};

class FieldBase extends React.Component<FieldProps, {}> {
  constructor(props: FieldProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onRemove = this.onRemove.bind(this);
  }
  public render(): JSX.Element {
    const {connectDragSource, onRemove} = this.props;
    const {field, type} = this.props.fieldDef;

    const component = (
      <span className="FieldInfo">
        {field} ({type.charAt(0)})
        {onRemove && <span> <a onClick={this.onRemove}>x</a></span>}
      </span>
    );

    // Wrap with connect dragSource if it is injected
    return connectDragSource ? connectDragSource(component) : component;
  }
  private onRemove() {
    this.props.onRemove();
  }
};

const fieldSource: DragSourceSpec<FieldProps> = {
  beginDrag(props) {
    return props.fieldDef;
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

export const Field = DragSource(DraggableType.FIELD, fieldSource, collect)(FieldBase) ;
