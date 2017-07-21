import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as DateTimePicker from 'react-datetime';
import * as TetherComponent from 'react-tether';
import {DateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND,
  FilterAction} from '../../actions/filter';
import * as styles from './range-filter-shelf.scss';
import {ActionHandler} from '../../actions/redux-action';

export interface RangeFilterShelfProps extends ActionHandler<FilterAction> {
  domain: number[] | DateTime[];
  filter: RangeFilter;
  index: number;
  type: ExpandedType;
}

export interface RangeFilterShelfState {
  minDateTimePickerOpen: boolean;
  maxDateTimePickerOpen: boolean;
}

export class RangeFilterShelfBase extends React.Component<RangeFilterShelfProps, RangeFilterShelfState> {
  public constructor(props: RangeFilterShelfProps) {
    super(props);
    this.state = ({
      minDateTimePickerOpen: false,
      maxDateTimePickerOpen: false
    });

    this.filterModifyMinBound = this.filterModifyMinBound.bind(this);
    this.filterModifyMaxBound = this.filterModifyMaxBound.bind(this);
    this.filterModifyExtent = this.filterModifyExtent.bind(this);
    this.toggleMinDateTimePicker = this.toggleMinDateTimePicker.bind(this);
    this.toggleMaxDateTimePicker = this.toggleMaxDateTimePicker.bind(this);
  }

  public render() {
    const {domain, filter, type} = this.props;
    const range = filter.range;
    const lowerBound = Math.floor(Number(domain[0]));
    const upperBound = Math.ceil(Number(domain[1]));
    let currMin, currMax, picker;
    if (type === ExpandedType.TEMPORAL) {
      currMin = new Date(range[0]);
      currMax = new Date(range[1]);
      picker = (
        <div>
          {this.renderDateTimePicker(currMin, 'min')}
          {this.renderDateTimePicker(currMax, 'max')}
        </div>
      );
    } else {
      currMin = range[0];
      currMax = range[1];
      picker = (
        <div>
          {this.renderQuantitativeInput(Number(currMin), 'min')}
          {this.renderQuantitativeInput(Number(currMax), 'max')}
        </div>
      );
    }
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);

    return (
      <div styleName='range-filter-pane'>
        {picker}
        <Range
          allowCross={false}
          defaultValue={[Number(currMin), Number(currMax)]}
          min={lowerBound}
          max={upperBound}
          onAfterChange={this.filterModifyExtent}
          tipFormatter={this.formatTime}
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

  private renderQuantitativeInput(value: number, bound: 'min' | 'max') {
    const {filter} = this.props;
    let action;
    if (bound === 'min') {
      action = this.filterModifyMinBound;
    } else if (bound === 'max') {
      action = this.filterModifyMaxBound;
    }
    return (
      <div styleName='bound'>
        {bound}: <a onClick={this.focusInput.bind(this, `${filter.field}_${bound}`)}><i className="fa fa-pencil"/></a>
        <input
          id={`${filter.field}_${bound}`}
          type='number'
          value={value.toString()}
          onChange={action}
        />
      </div>
    );
  }

  private renderDateTimePicker(date: Date, bound: 'min' | 'max') {
    let onChangeAction, dateTimePickerOpen, dataTimePickerOpenAction;
    if (bound === 'min') {
      onChangeAction = this.filterModifyMinBound;
      dateTimePickerOpen = this.state.minDateTimePickerOpen;
      dataTimePickerOpenAction = this.toggleMinDateTimePicker;
    } else if (bound === 'max') {
      onChangeAction = this.filterModifyMaxBound;
      dateTimePickerOpen = this.state.maxDateTimePickerOpen;
      dataTimePickerOpenAction = this.toggleMaxDateTimePicker;
    }
    return (
      <div>
        <TetherComponent
          attachment='bottom center'
        >
          <div styleName='bound'>
            {bound}:
            <a onClick={dataTimePickerOpenAction}><i className="fa fa-pencil"/></a>
            {date.toString()}
          </div>
          {dateTimePickerOpen &&
            <div styleName='date-time-picker-wrapper'>
              <DateTimePicker
                defaultValue={date}
                open={false}
                onChange={onChangeAction}
              />
            </div>
          }
        </TetherComponent>
      </div>
    );
  }

  private focusInput(id: string) {
    document.getElementById(id).focus();
  }

  private toggleMinDateTimePicker() {
    this.setState({
      minDateTimePickerOpen: !this.state.minDateTimePickerOpen
    });
  }

  private toggleMaxDateTimePicker() {
    this.setState({
      maxDateTimePickerOpen: !this.state.maxDateTimePickerOpen
    });
  }

  // TODO: https://github.com/vega/voyager/issues/443: use the time formatter Vega derives from D3
  private formatTime = (value: number) => {
    if (this.props.type === ExpandedType.TEMPORAL) {
      return new Date(value).toString();
    }
    return value;
  }
};

export const RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
