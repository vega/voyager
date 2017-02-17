import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import {Type} from 'vega-lite/src/type';

import {ShelfFieldDef, ShelfFunction} from '../../models/shelf';

export interface FunctionChooserProps {
  fieldDef: ShelfFieldDef;

  onFunctionChange: (fn: ShelfFunction) => void;
}

export class FunctionChooser extends React.PureComponent<FunctionChooserProps, any> {
  constructor(props: FunctionChooserProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
  }
  public render() {
    const {fieldDef} = this.props;

    const fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin' ) || undefined;
    const supportedFns = getSupportedFunction(fieldDef.type);
    const options = supportedFns.map(f => (
      <option key={f || '-'} value={f}>
        {f || '-'}
      </option>
    ));

    if (isWildcard(fn)) {
      throw new Error('Wildcard function not supported yet');
    } else {
      return options.length > 0 && (
        <select
          className="FunctionChooser"
          value={fn}
          onChange={this.onFunctionChange}
        >
          {options}
        </select>
      );
    }
  }
  private onFunctionChange(event: any) {
    this.props.onFunctionChange(event.target.value as ShelfFunction);
  }

}

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
