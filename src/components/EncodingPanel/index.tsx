import * as React from 'react';
import {connect} from 'react-redux';
import {Channel} from 'vega-lite/src/channel';

import {ActionHandler} from '../../actions/index';
import {createDispatchHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {State, UnitShelf} from '../../models';
import {EncodingShelf} from './EncodingShelf';
import {MarkShelf} from './MarkShelf';

interface EncodingPanelProps extends ActionHandler<ShelfAction> {
  shelf: UnitShelf;
}

class EncodingPanelBase extends React.Component<EncodingPanelProps, {}> {
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
          handleAction={this.props.handleAction}
        />

        {otherShelves}
      </div>
    );
  }

  /**
   * Return encoding shelf for normal (non-wildcard channels).
   */
  private encodingShelf(channel: Channel) {
    // This one can't be wildcard, thus we use VL's Channel, not our ShelfChannel

    const {encoding} = this.props.shelf;
    const {handleAction} = this.props;

    // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
    const EShelf = EncodingShelf as any;

    return (
      <EShelf
        key={channel}
        channel={channel}
        fieldDef={encoding[channel]}
        handleAction={handleAction}
      />
    );
  }
}

export const EncodingPanel = connect(
  (state: State) => {
    // FIXME use reselect
    return {shelf: state.shelf};
  },
  createDispatchHandler<ShelfAction>()
)(EncodingPanelBase);
