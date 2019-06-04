import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import {ShelfFunction} from '../../models/shelf';
import {getSupportedFunction} from '../../models/shelf';

export interface FunctionSelectorProps {
  fn: ShelfFunction;
  type: ExpandedType;

  onFunctionChange: (fn: ShelfFunction) => void;
}

export class FunctionSelector extends React.PureComponent<FunctionSelectorProps, any> {
  constructor(props: FunctionSelectorProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onFunctionChange = this.onFunctionChange.bind(this);
  }
  public render() {
    const {fn, type} = this.props;

    const supportedFns = getSupportedFunction(type);

    const options = supportedFns.map(f => (
      <option key={f || '-'} value={f}>
        {f || '-'}
      </option>
    ));

    return <select value={fn}>{options}</select>;
  }

  private onFunctionChange(event: any) {
    let shelfFunction = event.target.value;
    if (shelfFunction === '-') {
      shelfFunction = undefined;
    }

    this.props.onFunctionChange(shelfFunction);
  }
}
