import * as React from 'react';

import {ShelfMark} from '../../models';

import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {PRIMITIVE_MARKS} from 'vega-lite/src/mark';
import {ActionHandler} from '../../actions';
import {SHELF_MARK_CHANGE_TYPE, ShelfMarkChangeType} from '../../actions/shelf';

const ALL_MARKS = [SHORT_WILDCARD, ...PRIMITIVE_MARKS];

const options = ALL_MARKS.map(mark => (
  <option key={mark} value={mark}>
    {mark === SHORT_WILDCARD ? 'auto' : mark}
  </option>
));

interface MarkShelfProps extends ActionHandler<ShelfMarkChangeType> {
  mark: ShelfMark;
}

/**
 * Control for selecting mark type
 */
export class MarkShelf extends React.Component<MarkShelfProps, {}> {
  constructor(props: MarkShelfProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onMarkChange = this.onMarkChange.bind(this);
  }

  public render() {
    return (
      <select
        className="MarkShelf"
        value={this.props.mark}
        onChange={this.onMarkChange}
      >
        {options}
      </select>
    );
  }
  private onMarkChange(event: any) {
    this.props.handleAction({
      type: SHELF_MARK_CHANGE_TYPE,
      payload: event.target.value as ShelfMark
    });
  }
}
