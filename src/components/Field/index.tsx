import * as React from 'react';
import {DragElementWrapper, DragSource, DragSourceCollector, DragSourceSpec} from 'react-dnd';

import {DraggableType} from '../../constants';
import {FieldDef} from '../../models';

export interface FieldProps {
  fieldDef: FieldDef;

  draggable: boolean;

  // ======  React-dnd ======

  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDragSource?: DragElementWrapper<any>;

  // You can ask the monitor about the current drag state:
  isDragging?: boolean;
};


class Field extends React.Component<FieldProps, {}> {
  public render(): JSX.Element {
    const { connectDragSource } = this.props;
    const {field, type} = this.props.fieldDef;

    const component = (
      <div className="FieldInfo">
        {field} ({type.charAt(0)})
      </div>
    );

    // Wrap with connect dragSource if it is injected
    return connectDragSource ? connectDragSource(component) : component;
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
const collect: DragSourceCollector = (connect, monitor) => {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),

    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging()
  };
};

export default DragSource(DraggableType.FIELD, fieldSource, collect)(Field) ;
