import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND,
  FilterAction} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';
import * as styles from './range-component.scss';


export interface RangeComponentProps extends ActionHandler<FilterAction> {
  domain: number[];
  index: number;
  filter: RangeFilter;
}

export class RangeComponentBase extends React.PureComponent<RangeComponentProps, {}> {

  public constructor(props: RangeComponentProps) {
    super(props);
    this.filterModifyExtent = this.filterModifyExtent.bind(this);
    this.filterModifyMinBound = this.filterModifyMinBound.bind(this);
    this.filterModifyMaxBound = this.filterModifyMaxBound.bind(this);
  }

  public render() {
    const {filter, domain} = this.props;
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
          min={domain[0]}
          max={domain[1]}
          onAfterChange={this.filterModifyExtent.bind(this)}
        />
    </div>
    );
  }

  protected filterModifyExtent(range: number[]) {
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
      minBound = e;
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

  private focusInput(id: string) {
    document.getElementById(id).focus();
  }
}

export const RangeComponent = CSSModules(RangeComponentBase, styles);
