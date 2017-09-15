import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import {CUSTOM_WILDCARD_ADD, CustomWildcardAction} from '../../actions/custom-wildcard-field';
import {DraggableType} from '../../constants';
import {DraggedFieldIdentifier} from '../field/index';
import * as styles from './wildcard-field-drop-zone.scss';


export interface CustomWildcardFieldDropZoneDropTargetProps {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  item: Object;
  canDrop: boolean;
}

export interface CustomWildcardFieldDropZonePropsBase {
  schema: Schema;
  handleAction?: (action: CustomWildcardAction) => void;
}

interface CustomWildcardFieldDropZoneProps extends
  CustomWildcardFieldDropZoneDropTargetProps, CustomWildcardFieldDropZonePropsBase {};

class CustomWildcardFieldDropZoneBase extends React.PureComponent<CustomWildcardFieldDropZoneProps, {}> {
  public constructor(props: CustomWildcardFieldDropZoneProps) {
    super(props);
  }

  public render() {
    const {connectDropTarget} = this.props;

    return connectDropTarget(
      <div className='drop-zone'>
        Drop a field here!
      </div>
    );
  }
}


const customWildcardFieldTarget: DropTargetSpec<CustomWildcardFieldDropZoneProps> = {
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return;
    }

    const {fieldDef} = monitor.getItem() as DraggedFieldIdentifier;
    const type = fieldDef.type;

    let fields;
    if (isWildcard(fieldDef.field)) {
      if (fieldDef.field === '?') {
        const {schema} = props;
        fields = schema.fieldNames()
                        .filter(field => schema.vlType(field) === type);
      } else {
        fields = fieldDef.field.enum.concat([]);
      }
    } else {
      fields = [fieldDef.field];
    }

    props.handleAction({
      type: CUSTOM_WILDCARD_ADD,
      payload: {
        fields,
        type
      }
    });
  }
};


const collect: DropTargetCollector = (connect, monitor): CustomWildcardFieldDropZoneDropTargetProps => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    item: monitor.getItem(),
    canDrop: true
  };
};

// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
export const CustomWildcardFieldDropZone: () => React.PureComponent<CustomWildcardFieldDropZonePropsBase, {}> =
  DropTarget(
    DraggableType.FIELD, customWildcardFieldTarget, collect
  )(CSSModules(CustomWildcardFieldDropZoneBase, styles)) as any;
