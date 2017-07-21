import {FieldQuery} from 'compassql/build/src/query/encoding';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import {isOneOfFilter, isRangeFilter, OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_ADD, FILTER_REMOVE, FilterAction} from '../../actions/filter';
import {DraggableType} from '../../constants';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {DraggedFieldIdentifier} from '../field';
import * as styles from './filter-shelf.scss';
import {OneOfFilterShelf} from './one-of-filter-shelf';
import {RangeFilterShelf} from './range-filter-shelf';
import {TimeUnitFilterShelf} from './time-unit-filter-shelf';

/**
 * Props for react-dnd of FilterShelf
 */
export interface FilterShelfDropTargetProps {
  connectDropTarget: ConnectDropTarget;

  isOver: boolean;

  item: Object;
}

export interface FilterShelfPropsBase {
  filters: Array<RangeFilter | OneOfFilter>;
  fieldDefs: ShelfFieldDef[];
  schema: Schema;
  handleAction?: (action: FilterAction) => void;
}

export interface FilterShelfState {
  timeUnit: boolean;
}

interface FilterShelfProps extends FilterShelfDropTargetProps, FilterShelfPropsBase {};

class FilterShelfBase extends React.Component<FilterShelfProps, FilterShelfState> {
  public constructor(props: FilterShelfProps) {
    super(props);
    this.state = {
      timeUnit: false
    };
  }

  public render() {
    const {filters, connectDropTarget} = this.props;
    const filterShelves = filters.map((filter, index) => {
      return this.renderFilterShelf(filter, index);
    });
    return connectDropTarget(
      <div>
        {filterShelves}
        {this.fieldPlaceholder()}
      </div>
    );
  }

  protected filterRemove(index: number) {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_REMOVE,
      payload: {
        index
      }
    });
  }

  private renderFilterShelf(filter: RangeFilter | OneOfFilter, index: number) {
    const {fieldDefs, schema} = this.props;
    const fieldIndex = schema.fieldNames().indexOf(filter.field);
    const fieldDef = fieldDefs[fieldIndex];
    const domain = schema.domain(fieldDef as FieldQuery);
    return (
      <div styleName='filter-shelf' key={index}>
        <div styleName='header'>
          <span>{filter.field}</span>
            {
              fieldDef.type === ExpandedType.TEMPORAL ?
              <a onClick={this.toggleTimeUnit.bind(this)}>
                {this.state.timeUnit ? 'hide' : 'show'} time unit
              </a>
              : null
            }

          <a onClick={this.filterRemove.bind(this, index)}>
            <i className='fa fa-times'/>
          </a>
        </div>
        {this.renderFilter(filter, index, domain, fieldDef.type)}
      </div>
    );
  }

  private renderFilter(filter: RangeFilter | OneOfFilter, index: number, domain: any[], type: ExpandedType) {
    const {handleAction} = this.props;
    if (isRangeFilter(filter)) {
      if (this.state.timeUnit) {
        return (
          <TimeUnitFilterShelf domain={domain} index={index} field={filter.field} handleAction={handleAction}/>
        );
      } else {
        return (
          <RangeFilterShelf domain={domain} index={index} filter={filter} handleAction={handleAction} type={type}/>
        );
      }
    } else if (isOneOfFilter(filter)) {
      return (
        <OneOfFilterShelf domain={domain} index={index} filter={filter} handleAction={handleAction}/>
      );
    }
  }

  private fieldPlaceholder() {
    const {item, isOver} = this.props;
    return (
      <span styleName={isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder'}>
        Drop a field here
      </span>
    );
  }

  private toggleTimeUnit() {
    this.setState({
      timeUnit: !this.state.timeUnit
    });
  }
}

const filterShelfTarget: DropTargetSpec<FilterShelfProps> = {
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return;
    }
    const {filter} = monitor.getItem() as DraggedFieldIdentifier;
    if (isWildcard(filter.field)) {
      throw new Error ('Cannot add wildcard filter');
    }
    props.handleAction({
      type: FILTER_ADD,
      payload: {
        filter: filter
      }
    });
  }
};

const collect: DropTargetCollector = (connect, monitor): FilterShelfDropTargetProps => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    item: monitor.getItem()
  };
};

// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
export const FilterShelf: () => React.PureComponent<FilterShelfPropsBase, {}> = DropTarget(
  DraggableType.FIELD, filterShelfTarget, collect
)(CSSModules(FilterShelfBase, styles)) as any;
