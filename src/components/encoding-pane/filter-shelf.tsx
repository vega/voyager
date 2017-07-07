import {FieldQuery} from 'compassql/build/src/query/encoding';
import {Schema} from 'compassql/build/src/schema';
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

interface FilterShelfProps extends FilterShelfDropTargetProps, FilterShelfPropsBase {};

class FilterShelfBase extends React.Component<FilterShelfProps, {}> {

  public render() {
    const {filters, connectDropTarget} = this.props;
    let index = -1;
    const filterShelves = filters.map(filter => {
      index++;
      return this.renderFilterPane(filter, index);
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
        index: index
      }
    });
  }

  private renderFilterPane(filter: RangeFilter | OneOfFilter, index: number) {
    const {fieldDefs, schema} = this.props;
    const fieldIndex = schema.fieldNames().indexOf(filter.field);
    const domain = schema.domain(fieldDefs[fieldIndex] as FieldQuery);
    return (
      <div styleName='filter-shelf'>
        <div styleName='header'>
          <span>{filter.field}</span>
          <a onClick={this.filterRemove.bind(this, index)}>
            <i className='fa fa-times'/>
          </a>
        </div>
        {this.renderFilter(filter, index, domain)}
      </div>
    );
  }

  private renderFilter(filter: RangeFilter | OneOfFilter, index: number, domain: any[]) {
    const {handleAction} = this.props;
    if (isRangeFilter(filter)) {
      return <RangeFilterShelf domain={domain} index={index} filter={filter} handleAction={handleAction}/>;
    } else if (isOneOfFilter(filter)) {
      return <OneOfFilterShelf domain={domain} index={index} filter={filter} handleAction={handleAction}/>;
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
}

const filterShelfTarget: DropTargetSpec<FilterShelfProps> = {
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return;
    }

    const {filter} = monitor.getItem() as DraggedFieldIdentifier;
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
