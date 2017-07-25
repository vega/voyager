
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {DateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {convert, TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_MODIFY_TIME_UNIT, FilterAction} from '../../actions/filter';
import {FILTER_MODIFY_EXTENT} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';
import {RangeComponent} from './range-component';
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

export class TimeUnitFilterShelfBase extends React.Component<TimeUnitFilterShelfProps, TimeUnitFilterShelfState> {
  constructor(props: TimeUnitFilterShelfProps) {
    super(props);
    this.state = ({
      timeUnitChangerIsOpened: false,
      selectedTimeUnit: TimeUnit.MILLISECONDS // set the default to milliseconds???
    });

    this.filterModifyTimeUnit = this.filterModifyTimeUnit.bind(this);
  }

  public componentWillMount() {
    this.filterModifyTimeUnit(this.state.selectedTimeUnit);
    this.filterModifyExtent([this.getRange()[0], this.getRange()[1]]);
  }

  public render() {
    const {index, filter, handleAction} = this.props;
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
        <RangeComponent
          domain={[this.getRange()[0], this.getRange()[1]]}
          index={index}
          filter={filter}
          handleAction={handleAction}
        />
      </div>
    );
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
      type: FILTER_MODIFY_EXTENT,
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
