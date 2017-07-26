import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as Slider from 'rc-slider';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as DateTimePicker from 'react-datetime';
import * as TetherComponent from 'react-tether';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND,
  FilterAction} from '../../actions/filter';
import {ActionHandler} from '../../actions/redux-action';
import * as styles from './range-filter-shelf.scss';


export interface RangeFilterShelfProps extends ActionHandler<FilterAction> {
  domain: number[];
  index: number;
  filter: RangeFilter;
  type: ExpandedType;
}

export interface RangeFilterShelfState {
  minDateTimePickerOpen: boolean;
  maxDateTimePickerOpen: boolean;
}

export class RangeFilterShelfBase extends React.PureComponent<RangeFilterShelfProps, RangeFilterShelfState> {

  constructor(props: RangeFilterShelfProps) {
    super(props);
    this.state = ({
      minDateTimePickerOpen: false,
      maxDateTimePickerOpen: false
    });
    this.filterModifyExtent = this.filterModifyExtent.bind(this);
    this.filterModifyMaxBound = this.filterModifyMaxBound.bind(this);
    this.filterModifyMinBound = this.filterModifyMinBound.bind(this);
    this.toggleMinDateTimePicker = this.toggleMinDateTimePicker.bind(this);
    this.toggleMaxDateTimePicker = this.toggleMaxDateTimePicker.bind(this);
  }

  public render() {
    const {filter, domain, type} = this.props;
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Range = createSliderWithTooltip(Slider.Range);
    let minInput, maxInput, formatLabel;
    if (type === ExpandedType.TEMPORAL) {
      minInput = this.renderDateTimePicker(new Date(filter.range[0]), 'min');
      maxInput = this.renderDateTimePicker(new Date(filter.range[1]), 'max');
      formatLabel = this.formatTime;
    } else {
      minInput = this.renderNumberInput('min');
      maxInput = this.renderNumberInput('max');
    }
    const lowerBound = Math.floor(Number(domain[0]));
    const upperBound = Math.ceil(Number(domain[1]));

    return (
      <div styleName='range-filter-pane'>
        <div>
          <div styleName='bound'>
            {minInput}
          </div>
          <div styleName='bound'>
            {maxInput}
          </div>
        </div>
        <Range
          allowCross={false}
          defaultValue={[Number(filter.range[0]), Number(filter.range[1])]}
          min={lowerBound}
          max={upperBound}
          onAfterChange={this.filterModifyExtent.bind(this)}
          tipFormatter={formatLabel}
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

  private renderNumberInput(bound: 'min' | 'max') {
    const {filter} = this.props;
    let onChangeAction, value;
    if (bound === 'min') {
      onChangeAction = this.filterModifyMinBound;
      value = filter.range[0];
    } else if (bound === 'max') {
      onChangeAction = this.filterModifyMaxBound;
      value = filter.range[1];
    }
    return (
      <div>
      {bound}:
        <a onClick={this.focusInput.bind(this, `${filter.field}_${bound}`)}><i className="fa fa-pencil"/></a>
        <input
          id={`${filter.field}_${bound}`}
          type='number'
          value={value.toString()}
          onChange={onChangeAction}
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
  private formatTime = (value: number) : React.ReactText => {
    if (this.props.type === ExpandedType.TEMPORAL) {
      return new Date(value).toString();
    }
    return value.toString();
  }
}

export const RangeFilterShelf = CSSModules(RangeFilterShelfBase, styles);
