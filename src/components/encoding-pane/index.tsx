import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {Channel} from 'vega-lite/build/src/channel';

import * as styles from './encoding-pane.scss';

import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {ActionHandler} from '../../actions/index';
import {createDispatchHandler} from '../../actions/redux-action';
import {SHELF_CLEAR, ShelfAction} from '../../actions/shelf';
import {ShelfUnitSpec, State} from '../../models';
import {EncodingShelf} from './encoding-shelf';
import {MarkPicker} from './mark-picker';

interface EncodingPanelProps extends ActionHandler<ShelfAction> {
  spec: ShelfUnitSpec;

  preview: ShelfUnitSpec;
}

class EncodingPanelBase extends React.PureComponent<EncodingPanelProps, {}> {
  constructor(props: EncodingPanelProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onClear = this.onClear.bind(this);
  }
  public render() {
    const {anyEncodings} = this.props.spec;

    const positionShelves = ['x', 'y'].map(this.encodingShelf, this);
    const facetShelves = ['row', 'column'].map(this.encodingShelf, this);
    const nonPositionShelves = ['size', 'color', 'shape', 'detail', 'text'].map(this.encodingShelf, this);
    const wildcardShelves = [...anyEncodings.map((_, i) => i), anyEncodings.length + 1]
                                            .map(this.wildcardShelf, this);

    return (
      <div className="pane" styleName="encoding-pane">
        <a className="right" onClick={this.onClear}>
          <i className="fa fa-eraser"/>
          {' '}
          Clear
        </a>

        <div styleName="shelf-group">
          <h2>Encoding</h2>
          {positionShelves}
        </div>

        <div styleName="shelf-group">
          <div className="right">
            <MarkPicker
              mark={this.props.spec.mark}
              handleAction={this.props.handleAction}
            />
          </div>
          <h3>Mark</h3>
          {nonPositionShelves}
        </div>

        <div styleName="shelf-group">
          <h3>Facet</h3>
          {facetShelves}
        </div>

        <div styleName="shelf-group">
          <h3>Wildcard Shelves</h3>
          {wildcardShelves}
        </div>
      </div>
    );
  }

  /**
   * Return encoding shelf for normal (non-wildcard channels).
   */
  private encodingShelf(channel: Channel) {
    // This one can't be wildcard, thus we use VL's Channel, not our ShelfChannel

    const {encoding} = this.props.spec;
    const {handleAction} = this.props;

    return (
      <EncodingShelf
        key={channel}
        id={{channel}}
        fieldDef={encoding[channel]}
        handleAction={handleAction}
      />
    );
  }

  private wildcardShelf(index: number) {
    const {anyEncodings} = this.props.spec;
    const {handleAction} = this.props;

    const id = {
      channel: SHORT_WILDCARD,
      index
    };

    return (
      <EncodingShelf
        key={index}
        id={id}
        fieldDef={anyEncodings[index]}
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
    return {
      spec: state.present.shelf.spec,
      preview: state.present.shelf.specPreview
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(EncodingPanelBase, styles));
