import {FieldQuery} from 'compassql/build/src/query/encoding';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_ADD, FILTER_MODIFY_TIME_UNIT,
  FILTER_REMOVE, FilterAction} from '../../actions/filter';
import {DraggableType} from '../../constants';
import {ShelfFieldDef} from '../../models/shelf/encoding';
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
  fieldDefs: ShelfFieldDef[];
  schema: Schema;
  handleAction?: (action: FilterAction) => void;
}

interface FilterPaneProps extends FilterPaneDropTargetProps, FilterPanePropsBase {};

class FilterPaneBase extends React.Component<FilterPaneProps, {}> {
  // private index: number;

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
    const {fieldDefs, schema, handleAction} = this.props;
    const fieldIndex = schema.fieldNames().indexOf(filter.field);
    const fieldDef = fieldDefs[fieldIndex];
    let domain = schema.domain(fieldDef as FieldQuery);
    const popupComponent =
      fieldDef.type === ExpandedType.TEMPORAL &&
      <FunctionPicker
        fieldDef={fieldDef}
        filter={filter}
        index={index}
        onFunctionChange={this.filterModifyTimeUnit}
      />;
    let filterComponent;
    if (fieldDef.type === ExpandedType.QUANTITATIVE) {
      // quantitative range filter
      filterComponent = (
        <RangeFilterShelf
          domain={domain}
          index={index}
          filter={filter as RangeFilter}
          type={fieldDef.type}
          handleAction={handleAction}
        />
      );
    } else if (fieldDef.type === ExpandedType.TEMPORAL) {
      const timeUnit = filter.timeUnit;
      if (timeUnit) {
        if (timeUnit === TimeUnit.MONTH || timeUnit === TimeUnit.DAY) {
          // time unit one of filter
          domain = getDefaultList(timeUnit);
          filterComponent = (
            <OneOfFilterShelf
              domain={domain}
              index={index}
              filter={filter as OneOfFilter}
              handleAction={handleAction}
            />
          );
        } else {
          // time unit range filter
          domain = getDefaultRange(domain, timeUnit);
          let type;
          if (timeUnit === TimeUnit.YEARMONTHDATE) {
            type = ExpandedType.TEMPORAL;
          } else {
            type = ExpandedType.QUANTITATIVE;
          }
          filterComponent = (
            <RangeFilterShelf
              domain={domain}
              index={index}
              filter={filter as RangeFilter}
              type={type as ExpandedType}
              handleAction={handleAction}
            />
          );
        }
      } else {
        // no time unit range filter
        filterComponent = (
          <RangeFilterShelf
            domain={domain}
            index={index}
            filter={filter as RangeFilter}
            type={fieldDef.type}
            handleAction={handleAction}
          />
        );
      }
    } else {
      // type is Nominal, ordinal or key
      filterComponent = (
        <OneOfFilterShelf
          domain={domain}
          index={index}
          filter={filter as OneOfFilter}
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
