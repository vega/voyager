import * as React from 'react';
import {connect} from 'react-redux';
import {Channel} from 'vega-lite/src/channel';
import {Mark} from 'vega-lite/src/mark';

import {State, UnitShelf} from '../../models';
import {EncodingShelf} from './EncodingShelf';
import {MarkShelf} from './MarkShelf';

interface EncodingPanelProps {
  // Props
  shelf: UnitShelf;

  // Dispatch
  onMarkChange: (mark: Mark) => void;
}

class EncodingPanel extends React.Component<EncodingPanelProps, {}> {
  public render() {
    const positionShelves = ['x', 'y'].map(this.encodingShelf, this);
    const facetShelves = ['row', 'column'].map(this.encodingShelf, this);
    const otherShelves = ['size', 'color', 'shape', 'detail', 'text'].map(this.encodingShelf, this);

    return (
      <div className="shelf">
        <h2>Encoding</h2>
        {positionShelves}
        {facetShelves}

        <h3>Mark</h3>
        <MarkShelf
          mark={this.props.shelf.mark}
          onMarkChange={this.props.onMarkChange}
        />

        {otherShelves}
      </div>
    );
  }

  private encodingShelf(channel: Channel) {
    const {encoding} = this.props.shelf;

    return (
      <EncodingShelf
        key={channel}
        channel={channel}
        fieldDef={encoding[channel]}
      />
    );
  }
}



export default connect(
  (state: State) => {
    return {shelf: state.shelf};
  },
  (dispatch) => {
    return {
      onMarkChange: (mark: Mark) => {
        dispatch({
          type: 'shelf-mark-change-type',
          mark: mark
        });
      }
    };
  }
)(EncodingPanel);
