import {Schema} from 'compassql/build/src/schema';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import {CUSTOM_WILDCARD_ADD, CustomWildcardAction} from '../../actions/custom-wildcard-field';
import {ActionHandler} from '../../actions/redux-action';
import {DraggableType} from '../../constants';
import {DraggedFieldIdentifier} from '../field/index';
import * as styles from './wildcard-field-drop-zone.scss';


export interface CustomWildcardFieldDropZoneDropTargetProps {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  item: Object;
  canDrop: boolean;
}

export interface CustomWildcardFieldDropZonePropsBase extends ActionHandler<CustomWildcardAction> {
  schema: Schema;
}

interface CustomWildcardFieldDropZoneProps extends
  CustomWildcardFieldDropZoneDropTargetProps, CustomWildcardFieldDropZonePropsBase {};

class CustomWildcardFieldDropZoneBase extends React.PureComponent<CustomWildcardFieldDropZoneProps, {}> {
  public constructor(props: CustomWildcardFieldDropZoneProps) {
    super(props);
  }

  public render() {
    const {connectDropTarget, canDrop} = this.props;

    let styleName, text;
    if (canDrop) {
      styleName = 'drop-zone-can-drop';
      text = 'Drop to create a custom wildcard field';
    } else {
      styleName = 'drop-zone';
      text = '';
    }

    return connectDropTarget(
      <div styleName={styleName}>
        {text}
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
      if (fieldDef.field === SHORT_WILDCARD) {
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
  },
  canDrop(props, monitor) {
    const {fieldDef} = monitor.getItem() as DraggedFieldIdentifier;
    return fieldDef.field !== '*';
  }
};


const collect: DropTargetCollector = (connect, monitor): CustomWildcardFieldDropZoneDropTargetProps => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    item: monitor.getItem(),
    canDrop: monitor.canDrop()
  };
};

// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
export const CustomWildcardFieldDropZone: () => React.PureComponent<CustomWildcardFieldDropZonePropsBase, {}> =
  DropTarget(
    DraggableType.FIELD, customWildcardFieldTarget, collect
  )(CSSModules(CustomWildcardFieldDropZoneBase, styles)) as any;
