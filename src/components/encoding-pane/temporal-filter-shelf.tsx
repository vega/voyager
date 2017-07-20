
import * as React from 'react';
import {DateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {FilterAction} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';


export interface TemporalFilterShelfProps extends ActionHandler<FilterAction> {
  domain: DateTime[];
  filter: RangeFilter;
  index: number;
}

class TemporalFilterShelfBase extends React.Component<TemporalFilterShelfProps, {}> {
  public render() {
    const {domain} = this.props;
    console.log(domain[0].year);
    console.log(domain[0].quarter);
    console.log(domain[0].month);
    console.log(domain[0].date);
    console.log(domain[0].day);
    console.log(domain[0].hours);
    console.log(domain[0].minutes);
    console.log(domain[0].seconds);
    console.log(domain[0].milliseconds);
    // ????
    const min = new Date(domain[0]);
    const max = new Date(domain[1]);
    return (
      <div>
        {this.renderTime(min)}
        {this.renderTime(max)}
      </div>
    );
  }

  protected filterModifyMaxBound(e: any) {
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_MAX_BOUND,
      payload: {
        index,
        maxBound: new Date(e.target.value);
      }
    });
  }

  protected filterModifyMinBound(e: any) {
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_MIN_BOUND,
      payload: {
        index,
        minBound: new Date(e.target.value);
      }
    });
  }

  private renderTime(time: Date) {
    return (
      <div>
        year: {time.getFullYear()}
        month: {time.getMonth()}
        date: {time.getDate()}
        hours: {time.getHours()}
        minutes: {time.getMinutes()}
        seconds: {time.getSeconds()}
        milliseconds: {time.getMilliseconds()}
      </div>
    );
  }
}

export const TemporalFilterShelf = TemporalFilterShelfBase;
