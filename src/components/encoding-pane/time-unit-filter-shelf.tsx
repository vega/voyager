
import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {DateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {convert, TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND, FILTER_MODIFY_TIME_UNIT,
  FilterAction} from '../../actions/filter';
import {FILTER_MODIFY_BOTH_BOUNDS} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';
import * as styles from './time-unit-filter-shelf.scss';

export interface TimeUnitFilterShelfProps extends ActionHandler<FilterAction> {
  domain: DateTime[];
  index: number;
  field: string;
  filter: RangeFilter;
}

export interface TimeUnitFilterShelfState {
  timeUnitChangerIsOpened: boolean;
  selectedTimeUnit: string;
}

class TimeUnitFilterShelfBase extends React.Component<TimeUnitFilterShelfProps, TimeUnitFilterShelfState> {
  constructor(props: TimeUnitFilterShelfProps) {
    super(props);
    this.state = ({
      timeUnitChangerIsOpened: false,
      selectedTimeUnit: TimeUnit.MILLISECONDS // set the default to milliseconds???
    });

    this.filterModifyMinBound = this.filterModifyMinBound.bind(this);
    this.filterModifyMaxBound = this.filterModifyMaxBound.bind(this);
    this.filterModifyTimeUnit = this.filterModifyTimeUnit.bind(this);
  }

  public componentWillMount() {
    this.filterModifyTimeUnit(this.state.selectedTimeUnit);
    this.filterModifyExtent([this.getRange()[0], this.getRange()[1]]);
  }

  public render() {
    return (
      <div>
        <TetherComponent
          attachment="top left"
          targetAttachment="bottom left"
        >
          <div styleName='time-unit'>
            time unit: {this.state.selectedTimeUnit}
            <a onClick={this.toggleTimeUnitChanger.bind(this)}>
              <i className='fa fa-caret-down'/>
            </a>
          </div>
          {this.state.timeUnitChangerIsOpened ? this.renderTimeUnitChanger() : null}
        </TetherComponent>
        <div>
          {this.renderRange()}
        </div>
      </div>
    );
  }

  protected filterModifyMaxBound(e: any) {
    let maxBound;
    if (e.hasOwnProperty('target')) {
      maxBound = e.target.value;
    } else {
      maxBound = e;
    }
    const {handleAction, index} = this.props;
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
      e = minBound;
    }
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_MIN_BOUND,
      payload: {
        index,
        minBound
      }
    });
  }

  protected filterModifyExtent(e: any) {
    let range;
    if (e.hasOwnProperty('target')) {
      range = e.target.value;
    } else {
      range = e;
    }
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_BOTH_BOUNDS,
      payload: {
        index,
        range
      }
    });
  }

  protected filterModifyTimeUnit(e: any) {
    let timeUnit;
    if (e.hasOwnProperty('target')) {
      timeUnit = e.target.value;
    } else {
      timeUnit = e;
    }
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_TIME_UNIT,
      payload: {
        index,
        timeUnit
      }
    });
  }

  private renderTimeUnitChanger() {
    const timeUnitChanger = this.getAllTimeUnit().map(timeUnit => {
      return (
        <label key={timeUnit}>
          <input
            name='timeUnit'
            type="radio"
            value={timeUnit}
            checked={this.state.selectedTimeUnit === timeUnit}
            onChange={this.onTimeUnitChange.bind(this)}
          />
          {' '}
          {timeUnit}
        </label>
      );
    });
    return (
      <div styleName='time-unit-changer'>
        <a styleName='close' onClick={this.toggleTimeUnitChanger.bind(this)}>
          <i className='fa fa-close'/>
        </a>
        {timeUnitChanger}
      </div>
    );
  }

  private renderRange() {
    // TODO: refactor this part with range-filter-shelf.tsx
    const {filter} = this.props;
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);
    return (
      <div styleName='range-filter-pane'>
        <div>
          <div styleName='bound'>
            min: <a onClick={this.focusInput.bind(this, `${filter.field}_min`)}><i className="fa fa-pencil"/></a>
            <input
              id={`${filter.field}_min`}
              type='number'
              value={filter.range[0].toString()}
              onChange={this.filterModifyMinBound.bind(this)}
            />
          </div>
          <div styleName='bound'>
            max: <a onClick={this.focusInput.bind(this, `${filter.field}_max`)}><i className="fa fa-pencil"/></a>
            <input
              id={`${filter.field}_max`}
              type='number'
              value={filter.range[1].toString()}
              onChange={this.filterModifyMaxBound.bind(this)}
            />
          </div>
        </div>
        <Range
          allowCross={false}
          defaultValue={[Number(filter.range[0]), Number(filter.range[1])]}
          min={this.getRange()[0]}
          max={this.getRange()[1]}
          onAfterChange={this.filterModifyExtent.bind(this)}
        />
    </div>
    );
  }

  private focusInput(id: string) {
    document.getElementById(id).focus();
  }

  private toggleTimeUnitChanger() {
    this.setState({
      timeUnitChangerIsOpened: !this.state.timeUnitChangerIsOpened
    });
  }

  private async onTimeUnitChange(e: any) {
    this.setState({
      selectedTimeUnit: e.target.value,
    });
    await this.filterModifyTimeUnit(e);
    this.filterModifyExtent([this.getRange()[0], this.getRange()[1]]);
  }

  private getAllTimeUnit() {
    return [
      'yearmonthdate',
      'year', 'month',
      'quarter',
      'date', 'day',
      'hours', 'minutes',
      'seconds', 'milliseconds'
    ];
  }

  private getRange() {
    const {domain} = this.props;
    const timeUnit = this.state.selectedTimeUnit as TimeUnit;
    switch (timeUnit) {
      case TimeUnit.YEARMONTHDATE:
        return [Number(convert(timeUnit, new Date(domain[0]))),
          Number(convert(timeUnit, new Date(domain[0])))];
      case TimeUnit.YEAR:
        return [convert(timeUnit, new Date(domain[0])).getFullYear(),
          convert(timeUnit, new Date(domain[1])).getFullYear()];
      case TimeUnit.MONTH:
        return [1, 12];
      case TimeUnit.QUARTER:
        return [1, 4];
      case TimeUnit.DATE:
        return [1, 31];
      case TimeUnit.DAY:
        return [1, 7];
      case TimeUnit.HOURS:
        return [0, 23];
      case TimeUnit.MINUTES:
        return [0, 59];
      case TimeUnit.SECONDS:
        return [0, 59];
      case TimeUnit.MILLISECONDS:
        return [0, 99];
      default:
        throw new Error ('Invalid time unit ' + timeUnit);
    }
  }
}

export const TimeUnitFilterShelf = CSSModules(TimeUnitFilterShelfBase, styles);
