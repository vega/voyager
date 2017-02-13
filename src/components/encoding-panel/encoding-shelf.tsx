import * as React from 'react';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';

import { DraggableType } from '../../constants';
import {ShelfFieldDef} from '../../models';
import {Field} from '../field';

import './encoding-shelf.scss';

import * as classNames from 'classnames';
import {SHORT_WILDCARD} from 'compassql/src/wildcard';
import {ActionHandler} from '../../actions/index';
import {SHELF_FIELD_ADD, SHELF_FIELD_REMOVE, ShelfEncodingAction} from '../../actions/shelf';
import {ShelfId} from '../../models';
import {DraggedFieldIdentifier} from '../field/index';

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

    const {fieldDef} = monitor.getItem() as DraggedFieldIdentifier;
    props.handleAction({
      type: SHELF_FIELD_ADD,
      payload: {shelfId: props.id, fieldDef}
    });
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
    this.onRemove = this.onRemove.bind(this);
  }
  public render() {
    const {id, connectDropTarget, fieldDef, isOver} = this.props;
    const channelName = id.channel === SHORT_WILDCARD ? 'any' : id.channel;

    const classes = classNames({
      EncodingShelf: true,
      isOver: isOver
    });

    // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
    const F = Field as any;

    const field = (<F fieldDef={fieldDef} draggable={true} onRemove={this.onRemove}/>);

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
}

function FieldPlaceholder() {
  return (
    <span className="FieldPlaceholder">
      (Drop Field Here)
    </span>
  );
}

export const EncodingShelf = DropTarget(DraggableType.FIELD, encodingShelfTarget, collect)(EncodingShelfBase);
