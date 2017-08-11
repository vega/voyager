import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {ShelfFunction} from '../../models/shelf';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {getSupportedFunction} from '../../models/shelf/function';
import * as styles from './function-picker.scss';

export interface FunctionPickerProps {
  fieldDefParts: {
    // Using Mapped Type to extract parts of ShelfFieldDef
    [k in 'fn' | 'type']?: ShelfFieldDef[k]
  };

  onFunctionChange: (fn: ShelfFunction | TimeUnit) => void;
}

export class FunctionPickerBase extends React.PureComponent<FunctionPickerProps, any> {
  constructor(props: FunctionPickerProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
  }
  public render() {
    const {fieldDefParts} = this.props;

    const {fn, type} = fieldDefParts;
    const supportedFns = getSupportedFunction(type);
    const radios = supportedFns.map(f => (
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
    this.props.onFunctionChange(event.target.value);
  }
}

export const FunctionPicker = CSSModules(FunctionPickerBase, styles);

// FIXME: move this to other parts and expand with more rules and test?
