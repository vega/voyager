import * as React from 'react';
import {DateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND, FilterAction} from '../../actions/filter';

export interface RangeFilterShelfProps {
  domain: number[] | DateTime[];
  filter: RangeFilter;
  index: number;
  handleAction: (action: FilterAction) => void;
}

class RangeFilterShelfBase extends React.Component<RangeFilterShelfProps, {}> {
  public render() {
    const {domain} = this.props;
    return (
      <div>
        {domain}
      </div>
    );
  }

  protected filterModifyMaxBound(index: number, maxBound: number | DateTime) {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_MODIFY_MAX_BOUND,
      payload: {
        index,
        maxBound
      }
    });
  }

  protected filterModifyMinBound(index: number, minBound: number | DateTime) {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_MODIFY_MIN_BOUND,
      payload: {
        index,
        minBound
      }
    });
  }
}

export const RangeFilterShelf = RangeFilterShelfBase;
