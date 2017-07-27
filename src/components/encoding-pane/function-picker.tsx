import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {ShelfFieldDef, ShelfFunction} from '../../models/shelf';
import * as styles from './function-picker.scss';

export interface FunctionPickerProps {
  fieldDef: ShelfFieldDef;

  filter?: RangeFilter | OneOfFilter;

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
    const {fieldDef, filter, index} = this.props;
    let fn: any, name: string;
    if (filter) {
      fn = filter.timeUnit;
      name = index.toString();
    } else {
      fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin' ) || undefined;
      name = JSON.stringify(fieldDef);
    }
    const supportedFns = getSupportedFunction(fieldDef.type);
    const radios = supportedFns.map(f =>
      <label styleName="func-label" key={f || '-'}>
        <input
          name={name}
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
