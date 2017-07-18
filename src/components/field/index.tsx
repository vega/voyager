
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DragElementWrapper, DragSource, DragSourceCollector, DragSourceSpec} from 'react-dnd';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_ADD, FILTER_REMOVE, FilterAction} from '../../actions/filter';
import {DraggableType, FieldParentType} from '../../constants';
import {ShelfId} from '../../models/shelf';
import {ShelfFieldDef} from '../../models/shelf/encoding';
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

  caretHide?: boolean;

  caretOnClick?: () => void;

  parentId?: FieldParentId;

  draggable: boolean;

  /**
   * Add field event handler.  If not provided, add button will disappear.
   */
  onAdd?: (fieldDef: ShelfFieldDef) => void;

  onDoubleClick?: (fieldDef: ShelfFieldDef) => void;

  /** Remove field event handler.  If not provided, remove button will disappear. */
  onRemove?: () => void;

  handleAction?: (action: FilterAction) => void;

  filter?: RangeFilter | OneOfFilter;

  filterHide?: boolean;

  schema?: Schema;

};

export interface FieldProps extends FieldDragSourceProps, FieldPropsBase {};

class FieldBase extends React.PureComponent<FieldProps, {}> {
  constructor(props: FieldProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
  }

  public render(): JSX.Element {
    const {caretHide, caretOnClick, connectDragSource, fieldDef, isPill} = this.props;
    const {field, title} = fieldDef;
    const isWildcardField = isWildcard(field) || this.props.isEnumeratedWildcardField;

    const component = (
      <span
        styleName={isWildcardField ? 'wildcard-field-pill' : isPill ? 'field-pill' : 'field'}
        onDoubleClick={this.onDoubleClick}
      >
        {caretTypeSpan({caretHide, caretOnClick, type: fieldDef.type})}
        <span styleName="text" title={title}>
          {title || field}
        </span>
        {this.addFilterSpan()}
        {this.addSpan()}
        {this.removeSpan()}
      </span>
    );

    // Wrap with connect dragSource if it is injected
    return connectDragSource ? connectDragSource(component) : component;
  }

  protected filterAddToIndex(filter: RangeFilter | OneOfFilter, index: number): void {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_ADD,
      payload: {
        filter: filter,
        index
      }
    });
  }

  protected filterAddToEnd(filter: RangeFilter | OneOfFilter): void {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_ADD,
      payload: {
        filter: filter
      }
    });
  }

  protected filterRemove(index: number): void {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_REMOVE,
      payload: {
        index
      }
    });
  }

  private addSpan() {
    return this.props.onAdd && (
      <span><a onClick={this.onAdd}><i className="fa fa-plus"/></a></span>
    );
  }

  private removeSpan() {
    const onRemove = this.props.onRemove;
    return onRemove && (
      <span><a onClick={onRemove}><i className="fa fa-times"/></a></span>
    );
  }

  private addFilterSpan() {
    return !this.props.filterHide && (
      <span><a onClick={this.filterAddToEnd.bind(this, this.props.filter)}><i className='fa fa-filter'/></a></span>
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

// We combine caret and type span so that it's easier to click
function caretTypeSpan(props: {caretHide: boolean, caretOnClick: () => void, type: ExpandedType}) {
  const {caretHide, caretOnClick, type} = props;
  const icon = TYPE_ICONS[type];
  const title = TYPE_NAMES[type];

  return <span styleName="caret-type" onClick={caretOnClick}>
    {caretOnClick && <i className={(caretHide ? 'hidden ' : '') + 'fa fa-caret-down'}/>}
    {caretOnClick && ' '}
    {type && <i className={'fa ' + icon} styleName="type" title={title}/>}
  </span>;
}

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
  filter: RangeFilter | OneOfFilter;
}

const fieldSource: DragSourceSpec<FieldProps> = {
  beginDrag(props): DraggedFieldIdentifier {
    const {fieldDef, parentId, filter} = props;
    return {fieldDef, parentId, filter};
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
