import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import * as TetherComponent from 'react-tether';
import {contains} from 'vega-lite/build/src/util';
import {ActionHandler} from '../../actions/index';
import {
  SPEC_FIELD_ADD, SPEC_FIELD_MOVE, SPEC_FIELD_REMOVE, SPEC_FUNCTION_ADD_WILDCARD,
  SPEC_FUNCTION_CHANGE, SPEC_FUNCTION_DISABLE_WILDCARD, SPEC_FUNCTION_ENABLE_WILDCARD,
  SPEC_FUNCTION_REMOVE_WILDCARD, SpecEncodingAction
} from '../../actions/shelf';
import {DraggableType, FieldParentType} from '../../constants';
import {ShelfFieldDef, ShelfId} from '../../models';
import {ShelfFunction} from '../../models/shelf';
import {ShelfValueDef} from '../../models/shelf/spec';
import {isWildcardChannelId} from '../../models/shelf/spec/encoding';
import {DraggedFieldIdentifier, Field} from '../field/index';
import * as styles from './encoding-shelf.scss';
import {FieldCustomizer} from './field-customizer';
import {FunctionPicker, FunctionPickerWildcardHandler} from './function-picker';
import {CUSTOMIZABLE_ENCODING_CHANNELS} from './property-editor-schema';

/**
 * Props for react-dnd of EncodingShelf
 */
export interface EncodingShelfDropTargetProps {
  connectDropTarget: ConnectDropTarget;

  isOver: boolean;

  item: Object;
}

export interface EncodingShelfPropsBase extends ActionHandler<SpecEncodingAction> {
  id: ShelfId;

  fieldDef: ShelfFieldDef;

  valueDef: ShelfValueDef;

  schema: Schema;
}

interface EncodingShelfProps extends EncodingShelfPropsBase, EncodingShelfDropTargetProps {};

export interface EncodingShelfState {
  customizerIsOpened: boolean;
}
class EncodingShelfBase extends React.PureComponent<
  EncodingShelfProps, EncodingShelfState
> implements FunctionPickerWildcardHandler {
  private fieldCustomizer: HTMLElement;
  private encodingShelf: HTMLElement;

  constructor(props: EncodingShelfProps) {
    super(props);
    this.state = {
      customizerIsOpened: false
    };

    this.onWildcardAdd = this.onWildcardAdd.bind(this);
    this.onWildcardRemove = this.onWildcardRemove.bind(this);
    this.onWildcardDisable = this.onWildcardDisable.bind(this);
    this.onWildcardEnable = this.onWildcardEnable.bind(this);
    this.toggleCustomizer = this.toggleCustomizer.bind(this);
  }

  public componentWillUpdate(nextProps: EncodingShelfProps, nextState: EncodingShelfState) {
    if (!nextState) {
      return;
    }
    if (nextState.customizerIsOpened) {
      document.addEventListener('click', this.handleClickOutside.bind(this), true);
    } else if (this.state.customizerIsOpened) {
      document.removeEventListener('click', this.handleClickOutside.bind(this), true);
    }
  }

  public render() {
    const {id, connectDropTarget, fieldDef, handleAction} = this.props;

    const isWildcardShelf = isWildcard(id.channel);
    const channelName = isWildcardShelf ? 'any' : id.channel;

    return connectDropTarget(
      <div styleName={isWildcardShelf ? 'wildcard-shelf' : 'encoding-shelf'}>
        <div styleName="shelf-label">
          <TetherComponent
            attachment="top left"
            targetAttachment="bottom left"
          >
            {(fieldDef && !isWildcardChannelId(id) && contains(CUSTOMIZABLE_ENCODING_CHANNELS, id.channel)) ?
              <span onClick={this.toggleCustomizer} ref={this.fieldHandler}>
                {channelName}{' '} <i className={'fa fa-caret-down'}/>
              </span> :
              <span>
                {channelName}
              </span>
            }

            {this.state.customizerIsOpened &&
            <div ref={this.popupRefHandler}>
              <FieldCustomizer
                shelfId={id}
                fieldDef={fieldDef}
                handleAction={handleAction}
              />
            </div>
            }
          </TetherComponent>
        </div>
        {fieldDef ? this.renderField() : this.renderFieldPlaceholder()}
      </div>
    );
  }

  public onWildcardEnable() {
    const {id, handleAction} = this.props;

    handleAction({
      type: SPEC_FUNCTION_ENABLE_WILDCARD,
      payload: {
        shelfId: id
      }
    });
  }

  public onWildcardDisable() {
    const {id, handleAction} = this.props;

    handleAction({
      type: SPEC_FUNCTION_DISABLE_WILDCARD,
      payload: {
        shelfId: id
      }
    });
  }

  public onWildcardAdd(fn: ShelfFunction) {
    const {id, handleAction} = this.props;
    handleAction({
      type: SPEC_FUNCTION_ADD_WILDCARD,
      payload: {
        shelfId: id,
        fn
      }
    });
  }

  public onWildcardRemove(fn: ShelfFunction) {
    const {id, handleAction} = this.props;
    handleAction({
      type: SPEC_FUNCTION_REMOVE_WILDCARD,
      payload: {
        shelfId: id,
        fn
      }
    });
  }

  protected onFunctionChange(fn: ShelfFunction) {
    const {id, handleAction} = this.props;
    handleAction({
      type: SPEC_FUNCTION_CHANGE,
      payload: {
        shelfId: id,
        fn: fn
      }
    });
  }

  protected onRemove() {
    const {id, handleAction} = this.props;
    this.closePopup();
    handleAction({
      type: SPEC_FIELD_REMOVE,
      payload: id
    });
  }

  private renderField() {
    const {id, fieldDef, schema} = this.props;
    const renderFunctionPicker = fieldDef.type === 'quantitative' || fieldDef.type === 'temporal';

    const functionPicker = renderFunctionPicker ?
      <FunctionPicker
        fieldDefParts={fieldDef}
        onFunctionChange={this.onFunctionChange.bind(this)}
        wildcardHandler={this}
      /> : null;
    return (
      <div styleName='field-wrapper'>
        <Field
          draggable={true}
          fieldDef={fieldDef}
          caretShow={true}
          isPill={true}
          schema={schema}
          popupComponent={functionPicker}
          onRemove={this.onRemove.bind(this)}
          parentId={{type: FieldParentType.ENCODING_SHELF as FieldParentType.ENCODING_SHELF, id: id}}
        />
      </div>
    );
  }

  private renderFieldPlaceholder() {
    const {item, isOver} = this.props;
    return (
      <span styleName={isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder'}>
        Drop a field here
      </span>
    );
  }

  private popupRefHandler = (ref: any) => {
    this.fieldCustomizer = ref;
  }

  private fieldHandler = (ref: any) => {
    this.encodingShelf = ref;
  }

  private handleClickOutside(e: any) {
    if (this.fieldCustomizer && this.encodingShelf && (this.fieldCustomizer.contains(e.target) ||
      this.encodingShelf.contains(e.target))) {
      return;
    }
    this.closePopup();
  }

  private closePopup() {
    this.setState({
      customizerIsOpened: false
    });
  }

  private toggleCustomizer() {
    this.setState({
      customizerIsOpened: !this.state.customizerIsOpened
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
          type: SPEC_FIELD_ADD,
          // TODO(https://github.com/vega/voyager/issues/428):
          // support inserting a field between two existing fields on the wildcard shelf (replace = false)
          payload: {shelfId: props.id, fieldDef, replace: true}
        });
        break;
      case FieldParentType.ENCODING_SHELF:
        props.handleAction({
          type: SPEC_FIELD_MOVE,
          payload: {from: parentId.id, to: props.id}
        });
        break;
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
export const EncodingShelf: () => React.PureComponent<EncodingShelfPropsBase, {}> =
  DropTarget(DraggableType.FIELD, encodingShelfTarget, collect)(
    CSSModules(EncodingShelfBase, styles)
  ) as any;
