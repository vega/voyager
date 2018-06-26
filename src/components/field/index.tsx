import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DragElementWrapper, DragSource, DragSourceCollector, DragSourceSpec} from 'react-dnd';
import * as TetherComponent from 'react-tether';
import {FieldOneOfPredicate, FieldRangePredicate} from 'vega-lite/build/src/predicate';
import {DraggableType, FieldParentType} from '../../constants';
import {ShelfId} from '../../models/shelf';
import {ShelfFieldDef} from '../../models/shelf';
import {createDefaultFilter} from '../../models/shelf/filter';
import * as styles from './field.scss';

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

export interface FieldPropsBase {
  fieldDef: ShelfFieldDef;

  isPill: boolean;

  isEnumeratedWildcardField?: boolean;

  parentId?: FieldParentId;

  draggable: boolean;

  /**
   * Add field event handler.  If not provided, add button will disappear.
   */
  onAdd?: (fieldDef: ShelfFieldDef) => void;

  onDoubleClick?: (fieldDef: ShelfFieldDef) => void;

  /** Remove field event handler.  If not provided, remove button will disappear. */
  onRemove?: () => void;

  /**
   * If filter button is shown, we need to the status whether it is active and an event handler for onToggle
   */
  filter?: {
    active: boolean,
    onToggle: (fieldDef: ShelfFieldDef) => void
  };

  caretShow: boolean;

  schema?: Schema;

  /** If not provided, it does not have a popup */
  popupComponent?: JSX.Element;
};

export interface FieldProps extends FieldDragSourceProps, FieldPropsBase {};

export interface FieldState {
  popupIsOpened: boolean;
}

class FieldBase extends React.PureComponent<FieldProps, FieldState> {
  private field: HTMLElement;
  private popup: HTMLElement;

  constructor(props: FieldProps) {
    super(props);
    this.state = ({
      popupIsOpened: false
    });

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFilterToggle = this.onFilterToggle.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
  }

  public componentWillUpdate(nextProps: FieldProps, nextState: FieldState) {
    if (!nextState) {
      return;
    }
    if (nextState.popupIsOpened) {
      document.addEventListener('click', this.handleClickOutside.bind(this), true);
    } else if (this.state.popupIsOpened) {
      document.removeEventListener('click', this.handleClickOutside.bind(this), true);
    }
  }

  public render(): JSX.Element {
    const {connectDragSource, fieldDef, isPill, popupComponent} = this.props;
    const {fn, field, description} = fieldDef;
    const isWildcardField = isWildcard(field) || this.props.isEnumeratedWildcardField;

    /** Whether the fieldDef has a function that involves field. (Count doesn't involve a specific field.) */
    const isFieldFn = fn && fn !== 'count';

    let fnName;
    if (isWildcard(fn)) {
      fnName = (fn.enum.length > 1) ? '?' : fn.enum[0];
    } else {
      fnName = fn;
    }

    const component = (
      <span
        styleName={isWildcardField ? 'wildcard-field-pill' : isPill ? 'field-pill' : 'field'}
        onDoubleClick={this.onDoubleClick}
      >
        {this.renderCaretTypeSpan()}
        {this.renderFuncSpan(fnName)}
        <span styleName={isFieldFn ? 'fn-text' : 'text'}>
          {isWildcard(field) ? description : field !== '*' ? field : ''}
        </span>
        {this.renderAddFilterSpan()}
        {this.renderAddSpan()}
        {this.renderRemoveSpan()}
      </span>
    );
    // Wrap with connect dragSource if it is injected
    if (!popupComponent) {
      return connectDragSource ? connectDragSource(component) : component;
    } else {
      return (
        <div ref={this.fieldRefHandler} >
          <TetherComponent
            attachment="top left"
            targetAttachment="bottom left"
          >
            {connectDragSource ? connectDragSource(component) : component}
            <div ref={this.popupRefHandler}>
              {this.state.popupIsOpened && popupComponent}
            </div>
          </TetherComponent>
        </div>
      );
    }
  }

  protected onFilterToggle(): void {
    const {filter, fieldDef} = this.props;
    filter.onToggle(fieldDef);
  }

  private renderCaretTypeSpan() {
    const {caretShow, fieldDef, popupComponent} = this.props;
    const type = fieldDef.type;
    const icon = TYPE_ICONS[type];
    const title = TYPE_NAMES[type];
    return (
      <span styleName="caret-type" onClick={this.togglePopup}>
        {caretShow && <i className={(popupComponent ? '' : 'hidden ') + 'fa fa-caret-down'}/>}
        {caretShow && ' '}
        {type && <i className={'fa ' + icon} styleName="type" title={title}/>}
      </span>
    );
  }

  private renderAddSpan() {
    return this.props.onAdd && (
      <span><a onClick={this.onAdd}><i className="fa fa-plus"/></a></span>
    );
  }

  private renderRemoveSpan() {
    const onRemove = this.props.onRemove;
    return onRemove && (
      <span><a onClick={onRemove}><i className="fa fa-times"/></a></span>
    );
  }

  private renderAddFilterSpan() {
    const {filter, fieldDef} = this.props;
    if (filter && !isWildcard(fieldDef.field)) {
      const style = filter.active ? '' : 'filter-button-unadded';
      return this.props.filter && (
        <span styleName={style}>
          <a onClick={this.onFilterToggle}>
            <i className='fa fa-filter'/>
          </a>
        </span>
      );
    }
  }

  private renderFuncSpan(fnName: string) {
    return (
      <span styleName="func" title={fnName}>
        {fnName}
      </span>
    );
  }

  private onAdd() {
    this.props.onAdd(this.props.fieldDef);
  }

  private onDoubleClick() {
    if (this.props.onDoubleClick) {
      this.props.onDoubleClick(this.props.fieldDef);
    }
  }

  private handleClickOutside(e: any) {
    if (!this.field || this.field.contains(e.target) || this.popup.contains(e.target)) {
      return;
    }
    this.closePopup();
  }

  private closePopup() {
    if (this.props.popupComponent) {
      this.setState ({
        popupIsOpened: false
      });
    }
  }

  private togglePopup() {
    if (this.props.popupComponent) {
      this.setState({
        popupIsOpened: !this.state.popupIsOpened
      });
    }
  }

  private fieldRefHandler = (ref: any) => {
    this.field = ref;
  }
  private popupRefHandler = (ref: any) => {
    this.popup = ref;
  }
};

// FIXME add icon for key
const TYPE_NAMES = {
  nominal: 'text',
  ordinal: 'text-ordinal',
  quantitative: 'number',
  temporal: 'time',
  geographic: 'geo'
};

const TYPE_ICONS = {
  nominal: 'fa-font',
  ordinal: 'fa-font',
  quantitative: 'fa-hashtag',
  temporal: 'fa-calendar',
};

/**
 * Type and Identifier of Field's parent component
 */
export type FieldParentId = {
  type: typeof FieldParentType.ENCODING_SHELF,
  id: ShelfId
} | {
  type: typeof FieldParentType.FIELD_LIST
};

export interface DraggedFieldIdentifier {
  fieldDef: ShelfFieldDef;
  parentId: FieldParentId;
  filter: FieldRangePredicate | FieldOneOfPredicate;
}

const fieldSource: DragSourceSpec<FieldProps> = {
  beginDrag(props): DraggedFieldIdentifier {
    const {fieldDef, parentId, schema} = props;

    let domain;
    if (!isWildcard(fieldDef.field) && fieldDef.field !== '*') {
      domain = schema.domain({field: fieldDef.field});
    }
    const filter = createDefaultFilter(fieldDef, domain);
    return {fieldDef, parentId, filter};
  },
  canDrag(props, monitor) {
    return props.draggable;
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


// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
export const Field: () => React.PureComponent<FieldPropsBase, {}> =
  DragSource(DraggableType.FIELD, fieldSource, collect)(
    CSSModules(FieldBase, styles)
  ) as any;
