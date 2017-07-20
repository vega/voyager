import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {PRIMITIVE_MARKS} from 'vega-lite/build/src/mark';

import * as styles from './mark-picker.scss';

import {ActionHandler, SHELF_MARK_CHANGE_TYPE, ShelfMarkChangeType} from '../../actions';
import {ShelfMark} from '../../models';

const ALL_MARKS = [SHORT_WILDCARD, ...PRIMITIVE_MARKS];

const options = ALL_MARKS.map(mark => (
  <option key={mark} value={mark}>
    {mark === SHORT_WILDCARD ? 'auto' : mark}
  </option>
));

export interface MarkPickerProps extends ActionHandler<ShelfMarkChangeType> {
  mark: ShelfMark;
}

/**
 * Control for selecting mark type
 */
export class MarkPickerBase extends React.PureComponent<MarkPickerProps, {}> {
  constructor(props: MarkPickerProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onMarkChange = this.onMarkChange.bind(this);
  }

  public render() {
    const {mark} = this.props;
    return (
      <select
        styleName={isWildcard(mark) ? 'mark-picker-any' : 'mark-picker'}
        value={mark}
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

export const MarkPicker = CSSModules(MarkPickerBase, styles);
