import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {Type} from 'vega-lite/build/src/type';

import * as styles from './function-picker.scss';

import {ShelfFieldDef, ShelfFunction} from '../../models/shelf';

export interface FunctionPickerProps {
  fieldDef: ShelfFieldDef;

  onFunctionChange: (fn: ShelfFunction) => void;
}

class FunctionPickerBase extends React.PureComponent<FunctionPickerProps, any> {
  constructor(props: FunctionPickerProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
  }
  public render() {
    const {fieldDef} = this.props;

    const fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin' ) || undefined;
    const supportedFns = getSupportedFunction(fieldDef.type);
    const radios = supportedFns.map(f => (
      <label styleName="func-label" key={f || '-'}>
        <input type="radio" value={f} checked={f === fn} onChange={this.onFunctionChange}/>
        {' '}
        {f || '-'}
      </label>
    ));

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
    this.props.onFunctionChange(event.target.value as ShelfFunction);
  }
}

export const FunctionPicker = CSSModules(FunctionPickerBase, styles);

// FIXME: move this to other parts and expand with more rules and test?
function getSupportedFunction(type: Type) {
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
