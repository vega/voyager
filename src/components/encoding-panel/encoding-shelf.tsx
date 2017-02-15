import * as React from 'react';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';

import {DraggableType, FieldParentType} from '../../constants';
import {ShelfFieldDef} from '../../models';
import {Field} from '../field';

import './encoding-shelf.scss';

import * as classNames from 'classnames';
import {isWildcard} from 'compassql/src/wildcard';
import {ActionHandler} from '../../actions/index';
import {
  SHELF_FIELD_ADD, SHELF_FIELD_MOVE, SHELF_FIELD_REMOVE, SHELF_FUNCTION_CHANGE, ShelfEncodingAction
} from '../../actions/shelf';
import {ShelfFunction, ShelfId} from '../../models';
import {DraggedFieldIdentifier} from '../field/index';
import {FunctionChooser} from './function-chooser';

/**
 * Props for react-dnd of EncodingShelf
 */
export interface EncodingShelfDropTargetProps {
  connectDropTarget: ConnectDropTarget;

  isOver: boolean;
}

export interface EncodingShelfProps extends EncodingShelfDropTargetProps, ActionHandler<ShelfEncodingAction> {
  id: ShelfId;

  fieldDef: ShelfFieldDef;
}

const encodingShelfTarget: DropTargetSpec<EncodingShelfProps> = {
  // TODO: add canDrop
  drop(props, monitor) {
    // Don't drop twice for nested drop target
    if (monitor.didDrop()) {
      return;
    }

    const {fieldDef, parentId} = monitor.getItem() as DraggedFieldIdentifier;
    switch (parentId.type) {
      case FieldParentType.FIELD_LIST:
        props.handleAction({
          type: SHELF_FIELD_ADD,
          payload: {shelfId: props.id, fieldDef} // TODO: rename to to:
        });
        break;
      case FieldParentType.ENCODING_SHELF:
        props.handleAction({
          type: SHELF_FIELD_MOVE,
          payload: {from: parentId.id, to: props.id}
        });
      default:
        throw new Error('Field dragged from unregistered source type to EncodingShelf');
    }
  }
};

const collect: DropTargetCollector = (connect, monitor): EncodingShelfDropTargetProps => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
};

class EncodingShelfBase extends React.Component<EncodingShelfProps, {}> {
  constructor(props: EncodingShelfProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  public render() {
    const {id, connectDropTarget, fieldDef, isOver} = this.props;
    const channelName = isWildcard(id.channel) ? 'any' : id.channel;

    const classes = classNames({
      EncodingShelf: true,
      isOver: isOver
    });

    // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
    const F = Field as any;

    const field = (
      <span>
        <FunctionChooser fieldDef={fieldDef} onFunctionChange={this.onFunctionChange}/>
        <F
          fieldDef={fieldDef}
          parentId={{type: FieldParentType.ENCODING_SHELF, id: id}}
          draggable={true}
          onRemove={this.onRemove}
        />
      </span>
    );

    return connectDropTarget(
      <div className={classes}>
        <span>{channelName}: </span>
        {fieldDef ? field : FieldPlaceholder()}
      </div>
    );
  }
  private onRemove() {
    const {id, handleAction} = this.props;

    handleAction({
      type: SHELF_FIELD_REMOVE,
      payload: id
    });
  }

  private onFunctionChange(fn: ShelfFunction) {
    const {id, handleAction} = this.props;

    handleAction({
      type: SHELF_FUNCTION_CHANGE,
      payload: {
        shelfId: id,
        fn: fn
      }
    });
  }
}

function FieldPlaceholder() {
  return (
    <span className="FieldPlaceholder">
      (Drop Field Here)
    </span>
  );
}

export const EncodingShelf = DropTarget(DraggableType.FIELD, encodingShelfTarget, collect)(EncodingShelfBase);
