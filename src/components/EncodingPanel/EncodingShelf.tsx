import * as React from 'react';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';

import { DraggableType } from '../../constants';
import {ShelfChannel, ShelfFieldDef} from '../../models';
import {Field} from '../Field';

import './EncodingShelf.scss';

import * as classNames from 'classnames';
import {ActionHandler} from '../../actions/index';
import {SHELF_FIELD_ADD, SHELF_FIELD_REMOVE, ShelfEncodingAction} from '../../actions/shelf';

/**
 * Props for react-dnd of EncodingShelf
 */
export interface EncodingShelfDropTargetProps {
  connectDropTarget: ConnectDropTarget;

  isOver: boolean;
}

export interface EncodingShelfProps extends EncodingShelfDropTargetProps, ActionHandler<ShelfEncodingAction> {
  channel: ShelfChannel;
  fieldDef: ShelfFieldDef;
}

const encodingShelfTarget: DropTargetSpec<EncodingShelfProps> = {
  // TODO: add canDrop
  drop(props, monitor) {
    // Don't drop twice for nested drop target
    if (monitor.didDrop()) {
      return;
    }

    const item = monitor.getItem() as ShelfFieldDef;
    props.handleAction({
      type: SHELF_FIELD_ADD,
      payload: {channel: props.channel, fieldDef: item}
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
    const {channel, connectDropTarget, fieldDef, isOver} = this.props;

    const classes = classNames({
      EncodingShelf: true,
      isOver: isOver
    });

    // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
    const F = Field as any;

    const field = (<F fieldDef={fieldDef} draggable={true} onRemove={this.onRemove}/>);

    return connectDropTarget(
      <div className={classes}>
        <span>{channel}: </span>
        {fieldDef ? field : FieldPlaceholder()}
      </div>
    );
  }
  private onRemove() {
    const {channel, handleAction} = this.props;

    handleAction({
      type: SHELF_FIELD_REMOVE,
      payload: {channel}
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
