
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import {isOneOfFilter, isRangeFilter, OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_ADD, FILTER_MODIFY_TIME_UNIT,
  FILTER_REMOVE, FilterAction} from '../../actions/filter';
import {DraggableType} from '../../constants';
import {getDefaultList, getDefaultRange} from '../../reducers/shelf/filter';
import {DraggedFieldIdentifier} from '../field';
import {Field} from '../field/index';
import * as styles from './filter-pane.scss';
import {FunctionPicker} from './function-picker';
import {OneOfFilterShelf} from './one-of-filter-shelf';
import {RangeFilterShelf} from './range-filter-shelf';


/**
 * Props for react-dnd of FilterShelf
 */
export interface FilterPaneDropTargetProps {
  connectDropTarget: ConnectDropTarget;

  isOver: boolean;

  item: Object;
}

export interface FilterPanePropsBase {
  filters: Array<RangeFilter | OneOfFilter>;
  schema: Schema;
  handleAction?: (action: FilterAction) => void;
}

interface FilterPaneProps extends FilterPaneDropTargetProps, FilterPanePropsBase {};

class FilterPaneBase extends React.Component<FilterPaneProps, {}> {

  public constructor(props: FilterPaneProps) {
    super(props);
    this.filterModifyTimeUnit = this.filterModifyTimeUnit.bind(this);
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
        index: index
      }
    });
  }

  protected filterModifyTimeUnit(timeUnit: string, index: number) {
    const {handleAction} = this.props;
    if (timeUnit === '-') {
      timeUnit = undefined;
    }
    handleAction({
      type: FILTER_MODIFY_TIME_UNIT,
      payload: {
        index: index,
        timeUnit: timeUnit as TimeUnit
      }
    });
  }

  private renderFilterShelf(filter: RangeFilter | OneOfFilter, index: number) {
    const {handleAction, schema} = this.props;
    let domain = schema.domain({field: filter.field});
    const fieldSchema = schema.fieldSchema(filter.field);
    const fieldDef = {
      field: fieldSchema.name,
      type: fieldSchema.vlType
    };
    const onFunctionChange = (timeUnit: string) => {
      this.filterModifyTimeUnit(timeUnit, index);
    };
    const popupComponent =
      fieldDef.type === ExpandedType.TEMPORAL &&
      <FunctionPicker
        fieldDefParts={{
          timeUnit: filter.timeUnit,
          type: ExpandedType.TEMPORAL
        }}
        onFunctionChange={onFunctionChange}
      /> ;
    let filterComponent;
    const timeUnit = filter.timeUnit;
    if (isRangeFilter(filter)) {
      if (timeUnit) {
        domain = getDefaultRange(domain, timeUnit);
      }
      filterComponent = (
        <RangeFilterShelf
          domain={domain}
          filter={filter}
          index={index}
          renderDateTimePicker={this.renderDateTimePicker(fieldDef.type, filter.timeUnit)}
          handleAction={handleAction}
        />
      );
    } else if (isOneOfFilter(filter)) {
      if (timeUnit) {
        domain = getDefaultList(timeUnit);
      }
      filterComponent = (
        <OneOfFilterShelf
          domain={domain}
          index={index}
          filter={filter}
          handleAction={handleAction}
        />
      );
    }
    return (
      <div styleName='filter-shelf' key={index}>
        <Field
          draggable={false}
          fieldDef={fieldDef}
          filterHide={true}
          isPill={true}
          onRemove={this.filterRemove.bind(this, index)}
          popupComponent={popupComponent}
          handleAction={handleAction}
        />
        {filterComponent}
      </div>
    );
  }

  private fieldPlaceholder() {
    const {item, isOver} = this.props;
    return (
      <span styleName={isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder'}>
        Drop a field here
      </span>
    );
  }

  /**
   * returns whether we should render date time picker instead of normal number input
   */
  private renderDateTimePicker(type: ExpandedType, timeUnit: TimeUnit): boolean {
    if (!timeUnit) {
      if (type === ExpandedType.QUANTITATIVE) {
        return false;
      } else if (type === ExpandedType.TEMPORAL) {
        return true;
      }
    }
    switch (timeUnit) {
      case TimeUnit.YEAR:
      case TimeUnit.MONTH:
      case TimeUnit.DAY:
      case TimeUnit.DATE:
      case TimeUnit.HOURS:
      case TimeUnit.MINUTES:
      case TimeUnit.SECONDS:
      case TimeUnit.MILLISECONDS:
        return false;
      case TimeUnit.YEARMONTHDATE:
        return true;
      default:
        throw new Error(timeUnit + ' is not supported');
    }
  }
}

const filterShelfTarget: DropTargetSpec<FilterPaneProps> = {
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
        filter
      }
    });
  }
};

const collect: DropTargetCollector = (connect, monitor): FilterPaneDropTargetProps => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    item: monitor.getItem()
  };
};

// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
export const FilterPane: () => React.PureComponent<FilterPanePropsBase, {}> = DropTarget(
  DraggableType.FIELD, filterShelfTarget, collect
)(CSSModules(FilterPaneBase, styles)) as any;
