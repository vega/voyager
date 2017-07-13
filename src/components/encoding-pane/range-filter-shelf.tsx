import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
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
          <span styleName='bound'>
            min: <a onClick={this.focusInput.bind(this, `${filter.field}min`)}><i className="fa fa-pencil"/></a>
            <input
              id={`${filter.field}min`}
              type='text'
              value={Number(currMin)}
              onChange={this.filterModifyMinBound.bind(this)}
            />
          </span>
          <span styleName='bound'>
            max: <a onClick={this.focusInput.bind(this, `${filter.field}max`)}><i className="fa fa-pencil"/></a>
            <input
              id={`${filter.field}max`}
              type='text'
              value={Number(currMax)}
              onChange={this.filterModifyMaxBound.bind(this)}
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

  protected filterModifyMaxBound(e: any) {
    const value = Number(e.target.value);
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
    const value = Number(e.target.value);
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

  private focusInput(id: string) {
    document.getElementById(id).focus();
  }
};

export const RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
