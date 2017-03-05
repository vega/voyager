import * as React from 'react';
import {connect} from 'react-redux';
import {Channel} from 'vega-lite/build/src/channel';

import {ActionHandler} from '../../actions/index';
import {createDispatchHandler} from '../../actions/redux-action';
import {SHELF_CLEAR, ShelfAction} from '../../actions/shelf';
import {ShelfUnitSpec, State} from '../../models';
import {EncodingShelf} from './encoding-shelf';
import {MarkSelector} from './mark-selector';

interface EncodingPanelProps extends ActionHandler<ShelfAction> {
  shelf: ShelfUnitSpec;
}

class EncodingPanelBase extends React.PureComponent<EncodingPanelProps, {}> {
  constructor(props: EncodingPanelProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onClear = this.onClear.bind(this);
  }
  public render() {
    const positionShelves = ['x', 'y'].map(this.encodingShelf, this);
    const facetShelves = ['row', 'column'].map(this.encodingShelf, this);
    const otherShelves = ['size', 'color', 'shape', 'detail', 'text'].map(this.encodingShelf, this);

    return (
      <div className="encodingPane pane">
        <h2>Encoding</h2>
        <a onClick={this.onClear}>Clear</a>

        {positionShelves}
        {facetShelves}

        <h3>Mark</h3>
        <MarkSelector
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
        id={{channel}}
        fieldDef={encoding[channel]}
        handleAction={handleAction}
      />
    );
  }
  private onClear() {
    this.props.handleAction({type: SHELF_CLEAR});
  }
}


export const EncodingPane = connect(
  (state: State) => {
    return {shelf: state.present.shelf.spec};
  },
  createDispatchHandler<ShelfAction>()
)(EncodingPanelBase);
