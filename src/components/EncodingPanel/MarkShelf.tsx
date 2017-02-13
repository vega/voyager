import * as React from 'react';

import {Mark} from '../../models';

import {SHORT_WILDCARD} from 'compassql/src/wildcard';
import {PRIMITIVE_MARKS} from 'vega-lite/src/mark';

const ALL_MARKS = [SHORT_WILDCARD, ...PRIMITIVE_MARKS];

const options = ALL_MARKS.map(mark => (
  <option key={mark} value={mark}>
    {mark === SHORT_WILDCARD ? 'auto' : mark}
  </option>
));

export interface MarkShelfDispatcher {
  onMarkChange: (mark: Mark) => void;
}

interface MarkShelfProps extends MarkShelfDispatcher {
  mark: Mark;
}

/**
 * Control for selecting mark type
 */
export class MarkShelf extends React.Component<MarkShelfProps, {}> {

  public render() {
    return (
      <select
        className="MarkShelf"
        value={this.props.mark}
        onChange={this.onMarkChange.bind(this)}
      >
        {options}
      </select>
    );
  }
  private onMarkChange(event: any) {
    this.props.onMarkChange(event.target.value as Mark);
  }
}
