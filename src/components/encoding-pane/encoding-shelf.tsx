import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import * as TetherComponent from 'react-tether';

import * as styles from './encoding-shelf.scss';

import {ActionHandler} from '../../actions/index';
import {
  SHELF_FIELD_ADD, SHELF_FIELD_MOVE, SHELF_FIELD_REMOVE, SHELF_FUNCTION_CHANGE, ShelfEncodingAction
} from '../../actions/shelf';
import {DraggableType, FieldParentType} from '../../constants';
import {ShelfFieldDef, ShelfFunction, ShelfId} from '../../models';
import {DraggedFieldIdentifier, Field} from '../field/index';
import {FunctionPicker} from './function-picker';

/**
 * Props for react-dnd of EncodingShelf
 */
export interface EncodingShelfDropTargetProps {
  connectDropTarget: ConnectDropTarget;

  isOver: boolean;

  item: Object;
}

export interface EncodingShelfPropsBase extends ActionHandler<ShelfEncodingAction> {
  id: ShelfId;

  fieldDef: ShelfFieldDef;
}

interface EncodingShelfProps extends EncodingShelfPropsBase, EncodingShelfDropTargetProps {};

export interface EncodingShelfState {
  functionPopupOpen: boolean;
}

class EncodingShelfBase extends React.PureComponent<EncodingShelfProps, EncodingShelfState> {
  constructor(props: EncodingShelfProps) {
    super(props);
    this.state = {
      functionPopupOpen: false
    };

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.toggleFunctionPopup = this.toggleFunctionPopup.bind(this);
  }

  public render() {
    const {id, connectDropTarget, fieldDef} = this.props;

    const isWildcardShelf = isWildcard(id.channel);
    const channelName = isWildcardShelf ? 'any' : id.channel;

    return connectDropTarget(
      <div styleName={isWildcardShelf ? 'wildcard-shelf' : 'encoding-shelf'}>
        <div styleName="shelf-label">{channelName}</div>
        {fieldDef ? this.field() : this.fieldPlaceholder()}
      </div>
    );
  }

  // TODO: consider extracting this to another file
  private field() {
    const {id, fieldDef} = this.props;

    const caretHide = !(fieldDef.type === 'quantitative' || fieldDef.type === 'temporal');

    // TODO: apply is over
    // TODO(https://github.com/vega/voyager/issues/285): support clicking outside popup to disable

    return (
      <div styleName="field-wrapper">
        <TetherComponent
          attachment="top left"
          targetAttachment="bottom left"
        >
          <Field
            fieldDef={fieldDef}
            caretOnClick={this.toggleFunctionPopup}
            caretHide={caretHide}
            isPill={true}
            parentId={{type: FieldParentType.ENCODING_SHELF, id: id}}
            draggable={true}
            onRemove={this.onRemove}
          />

          { this.state.functionPopupOpen &&
            <FunctionPicker fieldDef={fieldDef} onFunctionChange={this.onFunctionChange}/>
          }
        </TetherComponent>
      </div>
    );
  }

  private toggleFunctionPopup() {
    this.setState({
      functionPopupOpen: !this.state.functionPopupOpen
    });
  }

  private fieldPlaceholder() {
    const {item, isOver} = this.props;
    return (
      <span styleName={isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder'}>
        Drop a field here
      </span>
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
    isOver: monitor.isOver(),
    item: monitor.getItem()
  };
};

// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
export const EncodingShelf: () => React.PureComponent<EncodingShelfPropsBase, EncodingShelfState> =
  DropTarget(DraggableType.FIELD, encodingShelfTarget, collect)(
    CSSModules(EncodingShelfBase, styles)
  ) as any;
