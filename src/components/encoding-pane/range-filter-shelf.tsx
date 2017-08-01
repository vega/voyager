import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as DateTimePicker from 'react-datetime';
import * as TetherComponent from 'react-tether';
import {DateTime, isDateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND,
  FilterAction} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';
import {convertToDateTimeObject, convertToTimestamp} from '../../reducers/shelf/filter';
import * as styles from './range-filter-shelf.scss';

export interface RangeFilterShelfProps extends ActionHandler<FilterAction> {
  domain: number[] | DateTime[];
  index: number;
  filter: RangeFilter;
  type: ExpandedType;
}

export interface RangeFilterShelfState {
  minDateTimePickerOpen: boolean;
  maxDateTimePickerOpen: boolean;
}

export class RangeFilterShelfBase extends React.PureComponent<RangeFilterShelfProps, RangeFilterShelfState> {

  constructor(props: RangeFilterShelfProps) {
    super(props);
    this.state = ({
      minDateTimePickerOpen: false,
      maxDateTimePickerOpen: false
    });
    this.filterModifyExtent = this.filterModifyExtent.bind(this);
    this.filterModifyMaxBound = this.filterModifyMaxBound.bind(this);
    this.filterModifyMinBound = this.filterModifyMinBound.bind(this);
    this.toggleMinDateTimePicker = this.toggleMinDateTimePicker.bind(this);
    this.toggleMaxDateTimePicker = this.toggleMaxDateTimePicker.bind(this);
  }

  public render() {
    const {filter, domain, type} = this.props;
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);
    let minInput, maxInput, formatLabel, currMin, currMax, lowerBound, upperBound;
    if (type === ExpandedType.TEMPORAL) {
      minInput = this.renderDateTimePicker(new Date(convertToTimestamp(filter.range[0] as DateTime)), 'min');
      maxInput = this.renderDateTimePicker(new Date(convertToTimestamp(filter.range[1] as DateTime)), 'max');
      currMin = convertToTimestamp(filter.range[0] as DateTime);
      currMax = convertToTimestamp(filter.range[1] as DateTime);
      // lowerBound = Math.floor(convertToTimestamp(domain[0] as DateTime));
      // upperBound = Math.ceil(convertToTimestamp(domain[1] as DateTime));
      formatLabel = this.formatTime;
    } else {
      minInput = this.renderNumberInput('min');
      maxInput = this.renderNumberInput('max');
      currMin = filter.range[0];
      currMax = filter.range[1];
    }
    lowerBound = Math.floor(Number(domain[0]));
    upperBound = Math.ceil(Number(domain[1]));
    if (isDateTime(domain[0])) {
      lowerBound = Math.floor(convertToTimestamp(domain[0] as DateTime));
    }
    if (isDateTime(domain[1])) {
      upperBound = Math.ceil(convertToTimestamp(domain[1] as DateTime));
    }
    let step;
    if (filter.timeUnit === TimeUnit.YEARMONTHDATE) {
      step = 24 * 60 * 60 * 1000; // step is one day
    }
    return (
      <div styleName='range-filter-pane'>
        <div>
          <div styleName='bound'>
            {minInput}
          </div>
          <div styleName='bound'>
            {maxInput}
          </div>
        </div>
         <Range
          allowCross={false}
          defaultValue={[currMin, currMax]}
          min={lowerBound}
          max={upperBound}
          onAfterChange={this.filterModifyExtent.bind(this)}
          tipFormatter={formatLabel}
          step={step}
        />
      </div>
    );
  }

  protected filterModifyExtent(range: number[] | DateTime[]) {
    if (this.props.type === ExpandedType.TEMPORAL) {
      range = [convertToDateTimeObject(range[0] as number), convertToDateTimeObject(range[1] as number)];
    }
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_EXTENT,
      payload: {
        index,
        range
      }
    });
  }

  protected filterModifyMaxBound(e: any) {
    let maxBound;
    if (e.hasOwnProperty('target')) {
      maxBound = e.target.value;
    } else {
      maxBound = e;
    }
    const {handleAction, index, type} = this.props;
    if (type === ExpandedType.TEMPORAL) {
      maxBound = convertToDateTimeObject(maxBound);
    }
    handleAction({
      type: FILTER_MODIFY_MAX_BOUND,
      payload: {
        index,
        maxBound
      }
    });
  }

  protected filterModifyMinBound(e: any) {
    let minBound;
    if (e.hasOwnProperty('target')) {
      minBound = e.target.value;
    } else {
      minBound = e;
    }
    const {handleAction, index, type} = this.props;
    if (type === ExpandedType.TEMPORAL) {
      minBound = convertToDateTimeObject(minBound);
    }
    handleAction({
      type: FILTER_MODIFY_MIN_BOUND,
      payload: {
        index,
        minBound
      }
    });
  }

  private renderNumberInput(bound: 'min' | 'max') {
    const {filter} = this.props;
    let onChangeAction, value;
    if (bound === 'min') {
      onChangeAction = this.filterModifyMinBound;
      value = filter.range[0];
    } else if (bound === 'max') {
      onChangeAction = this.filterModifyMaxBound;
      value = filter.range[1];
    }
    return (
      <div>
      {bound}:
        <a onClick={this.focusInput.bind(this, `${filter.field}_${bound}`)}><i className="fa fa-pencil"/></a>
        <input
          id={`${filter.field}_${bound}`}
          type='number'
          value={value.toString()}
          onChange={onChangeAction}
        />
      </div>
    );
  }

  private renderDateTimePicker(date: Date, bound: 'min' | 'max') {
    let onChangeAction, dateTimePickerOpen, dataTimePickerOpenAction;
    if (bound === 'min') {
      onChangeAction = this.filterModifyMinBound;
      dateTimePickerOpen = this.state.minDateTimePickerOpen;
      dataTimePickerOpenAction = this.toggleMinDateTimePicker;
    } else if (bound === 'max') {
      onChangeAction = this.filterModifyMaxBound;
      dateTimePickerOpen = this.state.maxDateTimePickerOpen;
      dataTimePickerOpenAction = this.toggleMaxDateTimePicker;
    }
    let timeFormat = true;
    if (this.props.filter.timeUnit === TimeUnit.YEARMONTHDATE) {
      timeFormat = false;
    }
    return (
      <div>
        <TetherComponent
          attachment='bottom center'
        >
          <div styleName='bound'>
            {bound}:
            <a onClick={dataTimePickerOpenAction}><i className="fa fa-pencil"/></a>
            {date.toString()}
          </div>
          {dateTimePickerOpen &&
            <div styleName='date-time-picker-wrapper'>
              <DateTimePicker
                defaultValue={date}
                timeFormat={timeFormat}
                open={false}
                onChange={onChangeAction}
                disableOnClickOutside={false}
              />
            </div>
          }
        </TetherComponent>
      </div>
    );
  }

  private focusInput(id: string) {
    document.getElementById(id).focus();
  }

  private toggleMinDateTimePicker() {
    this.setState({
      minDateTimePickerOpen: !this.state.minDateTimePickerOpen
    });
  }

  private toggleMaxDateTimePicker() {
    this.setState({
      maxDateTimePickerOpen: !this.state.maxDateTimePickerOpen
    });
  }

  // TODO: https://github.com/vega/voyager/issues/443: use the time formatter Vega derives from D3
  private formatTime = (value: number): string => {
    if (this.props.type === ExpandedType.TEMPORAL) {
      return new Date(value).toString();
    }
    return value.toString();
  }
}

export const RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
