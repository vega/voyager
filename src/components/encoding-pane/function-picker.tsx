import {isWildcard} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {contains} from 'vega-lite/build/src/util';
import {ShelfFunction} from '../../models/shelf';
import {ShelfFieldDef} from '../../models/shelf';
import {getSupportedFunction} from '../../models/shelf';
import * as styles from './function-picker.scss';

export interface FunctionPickerProps {
  fieldDefParts: {
    // Using Mapped Type to extract parts of ShelfFieldDef
    [k in 'fn' | 'type']?: ShelfFieldDef[k]
  };

  onFunctionChange: (fn: ShelfFunction | TimeUnit) => void;

  wildcardHandler?: FunctionPickerWildcardHandler;
}

export interface FunctionPickerWildcardHandler {
  onWildcardEnable: () => void;
  onWildcardDisable: () => void;
  onWildcardAdd: (fn: ShelfFunction) => void;
  onWildcardRemove: (fn: ShelfFunction) => void;
}

export class FunctionPickerBase extends React.PureComponent<FunctionPickerProps, any> {
  constructor(props: FunctionPickerProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
    this.onCheck = this.onCheck.bind(this);
    this.onFunctionCheck = this.onFunctionCheck.bind(this);
  }
  public render() {
    const {fieldDefParts, wildcardHandler} = this.props;

    const {fn, type} = fieldDefParts;
    const supportedFns = getSupportedFunction(type);
    const fnIsWildcard = isWildcard(fn);

    const checkboxradios = supportedFns.map(f => (
      <label styleName="func-label" key={f || '-'}>
        <input
          onChange={fnIsWildcard ? this.onFunctionCheck : this.onFunctionChange}
          type={fnIsWildcard ? "checkbox" : "radio"}
          checked={isWildcard(fn) ? contains(fn.enum, f) : (f === fn)}
          value={f || '-'}
        />
        {' '}
        {f || '-'}
      </label>
    ));

    return checkboxradios.length > 0 && (
      <div styleName="function-chooser">
        {
          wildcardHandler && (
          <label styleName="wildcard-button">
            <input type="checkbox" onChange={this.onCheck}/> Wildcard
          </label>
        )}
        <h4>Function</h4>
        {checkboxradios}
      </div>
    );
  }

  private onFunctionChange(event: any) {
    let shelfFunction = event.target.value;
    if (shelfFunction === '-') {
      shelfFunction = undefined;
    }

    this.props.onFunctionChange(shelfFunction);
  }

  private onFunctionCheck(event: any) {
    const checked = event.target.checked;

    let shelfFunction = event.target.value;
    if (shelfFunction === '-') {
      shelfFunction = undefined;
    }

    if (checked) {
      this.props.wildcardHandler.onWildcardAdd(shelfFunction);
    } else {
      this.props.wildcardHandler.onWildcardRemove(shelfFunction);
    }
  }

  private onCheck(event: any) {
    const checked = event.target.checked;

    if (checked) {
      this.props.wildcardHandler.onWildcardEnable();
    } else {
      this.props.wildcardHandler.onWildcardDisable();
    }
  }
}

export const FunctionPicker = CSSModules(FunctionPickerBase, styles);

// FIXME: move this to other parts and expand with more rules and test?
