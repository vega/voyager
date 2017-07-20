import {ExpandedType} from 'compassql/build/src/query/expandedtype';
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
  type: ExpandedType;
  handleAction: (action: FilterAction) => void;
}

class RangeFilterShelfBase extends React.Component<RangeFilterShelfProps, {}> {
  public render() {
    const {domain, filter, type} = this.props;
    const range = filter.range;
    const lowerBound = Math.floor(domain[0] as number);
    const upperBound = Math.ceil(domain[1] as number);
    let currMin, currMax;
    if (type === ExpandedType.TEMPORAL) {
      currMin = new Date(range[0]);
      currMax = new Date(range[1]);
    } else {
      currMin = range[0];
      currMax = range[1];
    }
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);

    function formatTime(value: number) {
      if (type === ExpandedType.TEMPORAL) {
        return new Date(value).toString();
      }
      return value;
    }

    return (
      <div styleName='range-filter-pane'>
        <div>
          <div styleName='bound'>
            min: <a onClick={this.focusInput.bind(this, `${filter.field}min`)}><i className="fa fa-pencil"/></a>
            <input
              id={`${filter.field}min`}
              type='text'
              value={currMin.toString()}
              onChange={this.filterModifyMinBound.bind(this)}
            />
          </div>
          <div styleName='bound'>
            max: <a onClick={this.focusInput.bind(this, `${filter.field}max`)}><i className="fa fa-pencil"/></a>
            <input
              id={`${filter.field}max`}
              type='text'
              value={currMax.toString()}
              onChange={this.filterModifyMaxBound.bind(this)}
            />
          </div>
        </div>
        <Range
          allowCross={false}
          defaultValue={[Number(currMin), Number(currMax)]}
          min={lowerBound}
          max={upperBound}
          onAfterChange={this.filterModifyBothBounds.bind(this)}
          tipFormatter={formatTime}
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

  private focusInput(id: string) {
    document.getElementById(id).focus();
  }
};

export const RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
