import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {isWildcard, SHORT_WILDCARD, Wildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {AggregateOp} from 'vega-lite/build/src/aggregate';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {ShelfFunction} from '../../models/shelf';
import * as styles from './function-picker.scss';

export interface FunctionPickerProps {
  fieldDefParts: {
    aggregate?: AggregateOp | Wildcard<AggregateOp>,
    bin?: boolean | SHORT_WILDCARD,
    timeUnit?: TimeUnit | Wildcard<TimeUnit>,
    type?: ExpandedType
  };

  index?: number;

  onFunctionChange: (fn: ShelfFunction | TimeUnit, index?: number) => void;
}

export class FunctionPickerBase extends React.PureComponent<FunctionPickerProps, any> {
  constructor(props: FunctionPickerProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
  }
  public render() {
    const {fieldDefParts} = this.props;
    const fn = fieldDefParts.aggregate || fieldDefParts.timeUnit || (fieldDefParts.bin && 'bin' ) || undefined;

    const supportedFns = getSupportedFunction(fieldDefParts.type);
    const radios = supportedFns.map(f =>
      <label styleName="func-label" key={f || '-'}>
        <input
          type="radio"
          value={f || '-'}
          checked={f === fn}
          onChange={this.onFunctionChange}
        />
        {' '}
        {f || '-'}
      </label>
    );

    if (isWildcard(fn)) {
      throw new Error('Wildcard function not supported yet');
    } else {
      return radios.length > 0 && (
        <div styleName="function-chooser">
          <h4>Function</h4>
          {radios}
        </div>
      );
    }
  }
  private onFunctionChange(event: any) {
    const {index} = this.props;
    if (index !== undefined) {
      this.props.onFunctionChange(event.target.value, index);
    } else {
      this.props.onFunctionChange(event.target.value as ShelfFunction);
    }
  }
}

export const FunctionPicker = CSSModules(FunctionPickerBase, styles);

// FIXME: move this to other parts and expand with more rules and test?
function getSupportedFunction(type: ExpandedType) {
  switch (type) {
    case 'quantitative':
      return [
        undefined,
        'bin',
        'min', 'max', 'mean', 'median', 'sum'
      ];

    case 'temporal':
      return [
        undefined,
        'yearmonthdate',
        'year', 'month', // hide 'quarter' for user study because it's buggy
        'date', 'day',
        'hours', 'minutes',
        'seconds', 'milliseconds'
      ];
  }
  return [];
}
