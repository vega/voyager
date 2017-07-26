import {FieldQuery} from 'compassql/build/src/query/encoding';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ConnectDropTarget, DropTarget, DropTargetCollector, DropTargetSpec} from 'react-dnd';
import {isOneOfFilter, isRangeFilter, OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_ADD, FILTER_MODIFY_EXTENT, FILTER_MODIFY_ONE_OF, FILTER_MODIFY_TIME_UNIT,
  FILTER_REMOVE, FilterAction} from '../../actions/filter';
import {DraggableType} from '../../constants';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {getAllTimeUnits, getDefaultList, getDefaultRange} from '../../reducers/shelf/filter';
import {DraggedFieldIdentifier} from '../field';
import {Field} from '../field/index';
import * as styles from './filter-shelf.scss';
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
        index
      }
    });
  }

  protected filterModifyTimeUnit(e: any, index: number, domain: number[]) {
    const {handleAction} = this.props;
    let timeUnit = e.target.value;
    if (timeUnit === '-') {
      timeUnit = undefined;
    }

    handleAction({
      type: FILTER_MODIFY_TIME_UNIT,
      payload: {
        index,
        timeUnit
      }
    });
    if (!timeUnit) {
      // reset range
      handleAction({
        type: FILTER_MODIFY_EXTENT,
        payload: {
          index,
          range: domain
        }
      });
      return;
    } else if (timeUnit === TimeUnit.MONTH || timeUnit === TimeUnit.DAY) {
      handleAction({
        type: FILTER_MODIFY_ONE_OF,
        payload: {
          index,
          oneOf: getDefaultList(domain, timeUnit)
        }
      });
    } else {
      handleAction({
        type: FILTER_MODIFY_EXTENT,
        payload: {
          index,
          range: getDefaultRange(domain, timeUnit)
        }
      });
    }
  }

  private renderFilterShelf(filter: RangeFilter | OneOfFilter, index: number) {
    const {fieldDefs, schema, handleAction} = this.props;
    const fieldIndex = schema.fieldNames().indexOf(filter.field);
    const fieldDef = fieldDefs[fieldIndex];
    let domain = schema.domain(fieldDef as FieldQuery);
    const popupComponent =
      fieldDef.type === ExpandedType.TEMPORAL && this.renderTimeUnitChanger(filter, index, domain));

    let filterComponent;
    if (isRangeFilter(filter)) {
      const timeUnit = filter.timeUnit;
      if (timeUnit) {
        domain = getRange(domain, timeUnit);
        if (timeUnit === TimeUnit.MONTH || timeUnit === TimeUnit.DAY) {
          filterComponent = (
            <OneOfFilterShelf
              domain={domain}
              index={index}
              filter={{field: filter.field, oneOf: domain}}
              handleAction={handleAction}
            />
          );
        } else {
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
              filter={filter}
              type={type as ExpandedType}
              handleAction={handleAction}
            />
          );
        }
      } else {
        filterComponent = (
          <RangeFilterShelf
            domain={domain}
            index={index}
            filter={filter}
            type={fieldDef.type}
            handleAction={handleAction}
          />
        );
      }
    } else if (isOneOfFilter(filter)) {
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

  private renderTimeUnitChanger(filter: RangeFilter | OneOfFilter, index: number, domain: number[]) {
    const timeUnits: TimeUnit[] = getAllTimeUnits();
    timeUnits.unshift('-' as undefined);

    const filterModifyTimeUnitHandler = (e: any) => {
      this.filterModifyTimeUnit(e, index, domain);
    };

    const timeUnitChanger = timeUnits.map(timeUnit => {
      return (
        <label key={timeUnit}>
          <input
            name='timeUnit'
            type="radio"
            value={timeUnit}
            checked={filter.timeUnit ? filter.timeUnit === timeUnit : timeUnit === '-' as undefined}
            onChange={filterModifyTimeUnitHandler}
          />
          {' '}
          {timeUnit}
        </label>
      );
    });
    return (
      <div styleName='time-unit-changer'>
        {timeUnitChanger}
      </div>
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
