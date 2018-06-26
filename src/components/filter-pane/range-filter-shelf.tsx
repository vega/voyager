
import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as DateTimePicker from 'react-datetime';
import * as TetherComponent from 'react-tether';
import {DateTime} from 'vega-lite/build/src/datetime';
import {FieldRangePredicate} from 'vega-lite/build/src/predicate';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND,
  FilterAction} from '../../actions';
import {ActionHandler} from '../../actions/redux-action';
import {convertToDateTimeObject, convertToTimestamp} from '../../models/shelf/filter';
import * as styles from './range-filter-shelf.scss';

export interface RangeFilterShelfProps extends ActionHandler<FilterAction> {
  domain: number[] | DateTime[];
  index: number;
  filter: FieldRangePredicate;
  renderDateTimePicker: boolean;
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
    const {filter, domain, renderDateTimePicker} = this.props;
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);
    let minInput, maxInput, currMin, currMax, lowerBound, upperBound;
    if (renderDateTimePicker) {
      // when render date time picker, it must be an temporal filter, thus the range must be DateTime[].
      minInput = this.renderDateTimePicker(new Date(convertToTimestamp(filter.range[0] as DateTime)), 'min');
      maxInput = this.renderDateTimePicker(new Date(convertToTimestamp(filter.range[1] as DateTime)), 'max');
      currMin = convertToTimestamp(filter.range[0] as DateTime);
      currMax = convertToTimestamp(filter.range[1] as DateTime);
      lowerBound = Math.floor(convertToTimestamp(domain[0] as DateTime));
      upperBound = Math.ceil(convertToTimestamp(domain[1] as DateTime));
    } else {
      minInput = this.renderNumberInput('min');
      maxInput = this.renderNumberInput('max');
      currMin = filter.range[0];
      currMax = filter.range[1];
      // Math.floor/ceil because the slider requires the the difference between max and min
      // must be a multiple of step (which is 1 by default)
      lowerBound = Math.floor(Number(domain[0]));
      upperBound = Math.ceil(Number(domain[1]));
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
          tipFormatter={this.getFormat(renderDateTimePicker, filter.timeUnit)}
          step={this.getStep(filter.timeUnit)}
        />
      </div>
    );
  }

  protected filterModifyExtent(input: number[]) {
    // filterModifyExtent is only triggered by slider, so input must be number[].
    let range: DateTime[] | number[];
    if (this.props.renderDateTimePicker) {
      range = [convertToDateTimeObject(input[0]), convertToDateTimeObject(input[1])];
    } else {
      range = input;
    }
    if (range[0] > range[1]) {
      window.alert('Invalid bound');
      return;
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
      maxBound = Number(e.target.value);
    } else {
      maxBound = e;
    }
    const {handleAction, index} = this.props;
    if (this.props.renderDateTimePicker) {
      maxBound = convertToDateTimeObject(maxBound);
    }
    const minBound = this.props.filter.range[0];
    if (maxBound < minBound) {
      window.alert('Maximum bound cannot be smaller than minimum bound');
      return;
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
      minBound = Number(e.target.value);
    } else {
      minBound = e;
    }
    const {handleAction, index, renderDateTimePicker} = this.props;
    if (renderDateTimePicker) {
      minBound = convertToDateTimeObject(minBound);
    }
    const range = this.props.filter.range;
    const maxBound = range[1];
    if (minBound > maxBound) {
      window.alert('Minimum bound cannot be greater than maximum bound');
      return;
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
                timeFormat={this.showTime(this.props.filter.timeUnit)}
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

  /**
   * returns whether to show the time component in the date time picker
   */
  private showTime(timeUnit: TimeUnit): boolean {
    switch (timeUnit) {
      case undefined:
      case TimeUnit.YEAR:
      case TimeUnit.MONTH:
      case TimeUnit.DAY:
      case TimeUnit.DATE:
      case TimeUnit.HOURS:
      case TimeUnit.MINUTES:
      case TimeUnit.SECONDS:
      case TimeUnit.MILLISECONDS:
        return true;
      case TimeUnit.YEARMONTHDATE:
        // hide time component as we do not care about it
        return false;
      default:
        throw new Error(timeUnit + ' is not supported');
    }
  }

  /**
   * Returns a function to format how the number is displayed in range filter for
   * the given time unit.
   */
  private getFormat(renderDateTime: boolean, timeUnit: TimeUnit) {
    if (!timeUnit) {
      if (renderDateTime) {
        // temporal filter without time unit
        // TODO: https://github.com/vega/voyager/issues/443: use the time formatter Vega derives from D3
        return (value: number) => {
          return new Date(value).toString();
        };
      } else {
        // quantitative filter
        return;
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
        // do not need to format these time units.
        return;
      case TimeUnit.YEARMONTHDATE:
        // TODO: https://github.com/vega/voyager/issues/443: use the time formatter Vega derives from D3
        return (value: number) => {
          return new Date(value).toString();
        };
      default:
        throw new Error(timeUnit + ' is not supported');
    }
  }

  /**
   * Returns the range filter step for the given time unit.
   */
  private getStep(timeUnit: TimeUnit) {
    switch (timeUnit) {
      case undefined:
      case TimeUnit.YEAR:
      case TimeUnit.MONTH:
      case TimeUnit.DAY:
      case TimeUnit.DATE:
      case TimeUnit.HOURS:
      case TimeUnit.MINUTES:
      case TimeUnit.SECONDS:
      case TimeUnit.MILLISECONDS:
        return 1;
      case TimeUnit.YEARMONTHDATE:
        return 24 * 60 * 60 * 1000; // step is one day in timestamp
      default:
        throw new Error(timeUnit + ' is not supported');
    }
  }
}

export const RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
