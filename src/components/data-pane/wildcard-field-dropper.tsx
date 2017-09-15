import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import {CUSTOM_WILDCARD_ADD_FIELD, CUSTOM_WILDCARD_REMOVE,
        CustomWildcardAction} from '../../actions/custom-wildcard-field';
import {DraggableType} from '../../constants';
import {CustomWildcardFieldDef} from '../../models/custom-wildcard-field';
import {DraggedFieldIdentifier} from '../field/index';
import * as styles from './wildcard-field-dropper.scss';


export interface CustomWildcardFieldDropTargetProps {
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  item: Object;
  canDrop: boolean;
}

export interface CustomWildcardFieldPropsBase {
  customWildcardField: CustomWildcardFieldDef;
  schema: Schema;
  index: number;
  handleAction?: (action: CustomWildcardAction) => void;
}

interface CustomWildcardFieldProps extends CustomWildcardFieldDropTargetProps, CustomWildcardFieldPropsBase {};

class CustomWildcardFieldBase extends React.PureComponent<CustomWildcardFieldProps, {}> {
  public constructor(props: CustomWildcardFieldProps) {
    super(props);
    this.customWildcardRemove = this.customWildcardRemove.bind(this);
  }

  public render() {
    const {connectDropTarget} = this.props;

    return connectDropTarget(this.props.children[0]);
  }

  private customWildcardRemove() {
    const {handleAction, index} = this.props;
    handleAction({
      type: CUSTOM_WILDCARD_REMOVE,
      payload: {
        index
      }
    });
  }
}

const customWildcardFieldTarget: DropTargetSpec<CustomWildcardFieldProps> = {
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return;
    }
    const {fieldDef} = monitor.getItem() as DraggedFieldIdentifier;
    const {handleAction, schema, customWildcardField, index} = props;

    const type = customWildcardField.type;
    if (type === fieldDef.type) {
      let fields: string[];
      if (isWildcard(fieldDef.field)) {
        if (fieldDef.field === '?') {
          fields = schema.fieldNames()
                          .filter(field => schema.vlType(field) === type);
        } else {
          fields = fieldDef.field.enum.concat([]);
        }
      } else {
        fields = [fieldDef.field];
      }

      handleAction({
        type: CUSTOM_WILDCARD_ADD_FIELD,
        payload: {
          fields,
          index
        }
      });
    } else {
      window.alert('Cannot create a wildcard that mixes multiple types');
    }
  }
};

const collect: DropTargetCollector = (connect, monitor): CustomWildcardFieldDropTargetProps => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    item: monitor.getItem(),
    canDrop: true
  };
};

// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
export const WildcardFieldDropper: () => React.PureComponent<CustomWildcardFieldPropsBase, {}> = DropTarget(
  DraggableType.FIELD, customWildcardFieldTarget, collect
)(CSSModules(CustomWildcardFieldBase, styles)) as any;
