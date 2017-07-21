import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {DateTime} from 'vega-lite/build/src/datetime';
import {convert, TimeUnit} from 'vega-lite/build/src/timeunit';
import {FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND, FilterAction} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';
import {RangeFilterShelf} from './range-filter-shelf';
import * as styles from './time-unit-filter-shelf.scss';

export interface TimeUnitFilterShelfProps extends ActionHandler<FilterAction> {
  domain: DateTime[];
  index: number;
  field: string;
}

export interface TimeUnitFilterShelfState {
  timeUnitChangerIsOpened: boolean;
  selectedTimeUnit: string;
}

class TimeUnitFilterShelfBase extends React.Component<TimeUnitFilterShelfProps, TimeUnitFilterShelfState> {
  public constructor(props: TimeUnitFilterShelfProps) {
    super(props);
    this.state = ({
      timeUnitChangerIsOpened: false,
      selectedTimeUnit: 'milliseconds' // set the default to milliseconds???
    });
  }

  public render() {
    const {domain, handleAction, index} = this.props;
    return (
      <div>
        <TetherComponent
          attachment="top left"
          targetAttachment="bottom left"
        >
          <div>
            Select time unit
            <a onClick={this.toggleTimeUnitChanger.bind(this)}>
              <i className='fa fa-caret-down'/>
            </a>
          </div>
          {this.state.timeUnitChangerIsOpened ? this.renderTimeUnitChanger() : null}
        </TetherComponent>
        <RangeFilterShelf
          domain={domain}
          filter={this.constructTimeUnitFilter()}
          index={index}
          type={ExpandedType.TEMPORAL}
          handleAction={handleAction}
        />
      </div>
    );
  }

  protected filterModifyMaxBound(e: any) {
    const value = e.target.value;
    if (isNaN(value)) {
      throw new Error('Max bound must be a valid number');
    }
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_MAX_BOUND,
      payload: {
        index,
        maxBound: value
      }
    });
  }

  protected filterModifyMinBound(e: any) {
    const value = e.target.value;
    if (isNaN(value)) {
      throw new Error('Min bound must be a valid number');
    }
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_MIN_BOUND,
      payload: {
        index,
        minBound: value
      }
    });
  }
  private toggleTimeUnitChanger() {
    this.setState({
      timeUnitChangerIsOpened: !this.state.timeUnitChangerIsOpened
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
            selected={this.state.selectedTimeUnit === timeUnit}
            onChange={this.onTimeUnitChange.bind(this)}
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

  private onTimeUnitChange(e: any) {
    this.setState({
      selectedTimeUnit: e.target.value
    });
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
        return [startDate.getMonth(), endDate.getMonth()];
      case 'quarter':
        return; // todo
      case 'date':
        return [startDate.getDate(), endDate.getDate()];
      case 'day':
        return [startDate.getDay(), endDate.getDay()];
      case 'hours':
        return [startDate.getHours(), endDate.getHours()];
      case 'minutes':
        return;
      case 'seconds':
        return;
      case 'milliseconds':
        return;
      default:
        throw new Error ('Invalid time unit ' + timeUnit);
    }
  }

  private constructTimeUnitFilter() {
    const timeUnit = this.state.selectedTimeUnit as TimeUnit;
    return {
      timeUnit,
      field: this.props.field,
      range: this.getRange()
    };
  }

  private renderTimeUnitSelection() {
    const timeUnit = this.state.selectedTimeUnit as TimeUnit;
    switch (timeUnit) {
      case 'yearmonthdate':
        return;
      case 'year':
        return;
      case 'month':
        return ;
      case 'quarter':
        return ; // todo
      case 'date':
        return ;
      case 'day':
        return ;
      case 'hours':
        return;
      case 'minutes':
        return;
      case 'seconds':
        return;
      case 'milliseconds':
        return;
      default:
        throw new Error ('Invalid time unit ' + timeUnit);
    }
  }

  private renderOptions(options: string[], bound: string) {
    let onChange: () => void;
    if (bound === 'min') {
      onChange = this.filterModifyMinBound.bind(this);
    } else if (bound === 'max') {
      onChange = this.filterModifyMaxBound.bind(this);
    }

    const optionsPane = options.map(option => {
      return (
        <label>
          <input name={this.props.field} value={option} onChange={onChange}/>
          {` ${option}`}
        </label>
      );
    });
    return (
      <div>
        {optionsPane}
      </div>
    );
  }



  private changeBound(e: any) {
    console.log(e.target.value);
  }
}

export const TimeUnitFilterShelf = CSSModules(TimeUnitFilterShelfBase, styles);
