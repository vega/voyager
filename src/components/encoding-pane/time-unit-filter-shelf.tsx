
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {DateTime} from 'vega-lite/build/src/datetime';
import {convert, TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND, FILTER_MODIFY_TIME_UNIT,
  FilterAction} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';
import * as styles from './time-unit-filter-shelf.scss';

export interface TimeUnitFilterShelfProps extends ActionHandler<FilterAction> {
  domain: DateTime[];
  index: number;
  field: string;
}

export interface TimeUnitFilterShelfState {
  minBound: number;
  maxBound: number;
  timeUnitChangerIsOpened: boolean;
  selectedTimeUnit: string;
}

class TimeUnitFilterShelfBase extends React.Component<TimeUnitFilterShelfProps, TimeUnitFilterShelfState> {
  constructor(props: TimeUnitFilterShelfProps) {
    super(props);
    this.state = ({
      minBound: Number(props.domain[0]),
      maxBound: Number(props.domain[1]),
      timeUnitChangerIsOpened: false,
      selectedTimeUnit: TimeUnit.MILLISECONDS // set the default to milliseconds???
    });

    this.filterModifyMinBound = this.filterModifyMinBound.bind(this);
    this.filterModifyMaxBound = this.filterModifyMaxBound.bind(this);
    this.filterModifyTimeUnit = this.filterModifyTimeUnit.bind(this);
  }

  public componentWillMount() {
    this.filterModifyTimeUnit(this.state.selectedTimeUnit);
  }

  public render() {
    return (
      <div>
        <TetherComponent
          attachment="top left"
          targetAttachment="bottom left"
        >
          <div>
            Time Unit: {this.state.selectedTimeUnit}
            <a onClick={this.toggleTimeUnitChanger.bind(this)}>
              <i className='fa fa-caret-down'/>
            </a>
          </div>
          {this.state.timeUnitChangerIsOpened ? this.renderTimeUnitChanger() : null}
        </TetherComponent>
        <div>
          min: {this.renderOptions(this.getRange(), 'min')}
          max: {this.renderOptions(this.getRange(), 'max')}
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
        <div>
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
        </div>
      );
    });
    return (
      <div styleName='time-unit-changer'>
        <a onClick={this.toggleTimeUnitChanger.bind(this)}>
            <i className='fa fa-close'/>
        </a>
        {timeUnitChanger}
      </div>
    );
  }

  private renderOptions(options: number[], bound: 'min' | 'max') {
    let onChangeAction: any, selectedBound;
    if (bound === 'min') {
      onChangeAction = this.filterModifyMinBound;
      selectedBound = this.state.minBound;
    } else if (bound === 'max') {
      onChangeAction = this.filterModifyMaxBound;
      selectedBound = this.state.maxBound;
    }
    const optionsPane = [];
    for (let i = options[0]; i <= options[1]; i++) {
      optionsPane.push(
        <option value={i} key={i} defaultValue={selectedBound.toString()}>
          {i}
        </option>
      );
    }
    return (
      <select onChange={onChangeAction}>
        {optionsPane}
      </select>
    );
  }

  private toggleTimeUnitChanger() {
    this.setState({
      timeUnitChangerIsOpened: !this.state.timeUnitChangerIsOpened
    });
  }

  private onTimeUnitChange(e: any) {
    const minBound = this.getRange()[0];
    const maxBound = this.getRange()[1];
    this.setState({
      selectedTimeUnit: e.target.value,
      minBound,
      maxBound
    });
    this.filterModifyTimeUnit(e);
    this.filterModifyMinBound(minBound);
    this.filterModifyMaxBound(maxBound);
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
    const startDate = convert(timeUnit, new Date(domain[0]));
    const endDate = convert(timeUnit, new Date(domain[1]));
    switch (timeUnit) {
      case 'yearmonthdate':
        // return;
      case 'year':
        return [startDate.getFullYear(), endDate.getFullYear()];
      case 'month':
        return [1, 12];
      case 'quarter':
        return [1, 4];
      case 'date':
        return [1, 31];
      case 'day':
        return [1, 7];
      case 'hours':
        return [0, 23];
      case 'minutes':
        return [0, 59];
      case 'seconds':
        return [0, 59];
      case 'milliseconds':
        return [0, 99];
      default:
        throw new Error ('Invalid time unit ' + timeUnit);
    }
  }
}

export const TimeUnitFilterShelf = CSSModules(TimeUnitFilterShelfBase, styles);
