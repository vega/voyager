import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import InlineEdit from 'react-edit-inline';
import {DateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_MODIFY_BOTH_BOUNDS, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND,
  FilterAction} from '../../actions/filter';
import * as styles from './range-filter-shelf.scss';

export interface RangeFilterShelfProps {
  domain: number[] | DateTime[];
  filter: RangeFilter;
  index: number;
  handleAction: (action: FilterAction) => void;
}

class RangeFilterShelfBase extends React.Component<RangeFilterShelfProps, {}> {
  public render() {
    const {domain, filter} = this.props;
    const range = filter.range;
    const lowerBound = Math.floor(domain[0] as number);
    const upperBound = Math.ceil(domain[1] as number);
    const currMin = range[0];
    const currMax = range[1];
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);
    return (
      <div styleName='range-filter-pane'>
        <div styleName='range-input'>
          <span>
            min:
            <InlineEdit
              text={currMin.toString()}
              paramName='min'
              activeClassName='editing'
              change={this.filterModifyMinBound.bind(this)}
            />
          </span>
          <span>
            max:
            <InlineEdit
              text={currMax.toString()}
              paramName='max'
              activeClassName='editing'
              change={this.filterModifyMaxBound.bind(this)}
            />
          </span>
        </div>
        <Range
          allowCross={false}
          defaultValue={[currMin, currMax]}
          min={lowerBound}
          max={upperBound}
          onAfterChange={this.filterModifyBothBounds.bind(this)}
        />
      </div>
    );
  }

  protected filterModifyBothBounds(range: number[]) {
    const {handleAction, index} = this.props;
    handleAction({
      type: FILTER_MODIFY_BOTH_BOUNDS,
      payload: {
        index,
        range
      }
    });
  }

  protected filterModifyMaxBound(max: {max: string}) {
    const {handleAction, index} = this.props;
    const maxBound = Number(max.max);
    handleAction({
      type: FILTER_MODIFY_MAX_BOUND,
      payload: {
        index,
        maxBound
      }
    });
  }

  protected filterModifyMinBound(min: {min: string}) {
    const {handleAction, index} = this.props;
    const minBound = Number(min.min);
    handleAction({
      type: FILTER_MODIFY_MIN_BOUND,
      payload: {
        index,
        minBound
      }
    });
  }
};

export const RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
