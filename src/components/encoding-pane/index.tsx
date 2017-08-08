import {Schema} from 'compassql/build/src/schema';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {Channel} from 'vega-lite/build/src/channel';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {FilterAction} from '../../actions/filter';
import {ActionHandler} from '../../actions/index';
import {createDispatchHandler} from '../../actions/redux-action';
import {ResultAsyncAction} from '../../actions/result';
import {SHELF_CLEAR, ShelfAction} from '../../actions/shelf';
import {ShelfUnitSpec, State} from '../../models';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {selectSchemaFieldDefs} from '../../selectors/index';
import * as styles from './encoding-pane.scss';
import {EncodingShelf} from './encoding-shelf';
import {FilterPane} from './filter-pane';
import {MarkPicker} from './mark-picker';



interface EncodingPanelProps extends ActionHandler<ShelfAction | ResultAsyncAction | FilterAction> {
  spec: ShelfUnitSpec;

  specPreview: ShelfUnitSpec;

  filters: Array<RangeFilter | OneOfFilter>;

  schema: Schema;

  fieldDefs: ShelfFieldDef[];
}

class EncodingPanelBase extends React.PureComponent<EncodingPanelProps, {}> {
  constructor(props: EncodingPanelProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onClear = this.onClear.bind(this);
  }

  public render() {
    const {specPreview} = this.props;
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

        <h2>
          Encoding
          {specPreview && ' Preview'}
        </h2>

        <div styleName="shelf-group">
          {positionShelves}
        </div>

        <div styleName="shelf-group">
          <div className="right">
            {this.markPicker()}
          </div>
          <h3>Mark</h3>
          {nonPositionShelves}
        </div>

        <div styleName="shelf-group">
          <h3>Facet</h3>
          {facetShelves}
        </div>

        {/* TODO: correctly highlight field in the wildcard */}
        <div styleName="shelf-group">
          <h3>Wildcard Shelves</h3>
          {wildcardShelves}
        </div>

        <div styleName="shelf-group">
          <h3>Filter</h3>
          {this.filterPane()}
        </div>
      </div>
    );
  }

  /**
   * Return encoding shelf for normal (non-wildcard channels).
   */
  private encodingShelf(channel: Channel) {
    // This one can't be wildcard, thus we use VL's Channel, not our ShelfChannel

    const {handleAction, spec, specPreview, schema} = this.props;
    const {encoding} = specPreview || spec;
    return (
      <EncodingShelf
        key={channel}
        id={{channel}}
        fieldDef={encoding[channel]}
        schema={schema}
        handleAction={handleAction}
      />
    );
  }

  private markPicker() {
    const {handleAction, spec, specPreview} = this.props;
    const {mark} = specPreview || spec;
    return <MarkPicker
      mark={mark}
      handleAction={handleAction}
    />;
  }

  private wildcardShelf(index: number) {
    const {anyEncodings} = this.props.spec;
    const {handleAction, schema} = this.props;

    const id = {
      channel: SHORT_WILDCARD,
      index
    };

    return (
      <EncodingShelf
        key={index}
        id={id}
        schema={schema}
        fieldDef={anyEncodings[index]}
        handleAction={handleAction}
      />
    );
  }

  private filterPane() {
    const {filters, schema, handleAction} = this.props;
    return (
      <div styleName='filter-shelf'>
        <FilterPane
          filters={filters}
          schema={schema}
          handleAction={handleAction}
        />
      </div>
    );
  }

  private onClear() {
    this.props.handleAction({type: SHELF_CLEAR});
  }
}

export const EncodingPane = connect(
  (state: State) => {
    const presentUndoableState = state.undoable.present;
    return {
      spec: presentUndoableState.shelf.spec,
      filters: presentUndoableState.shelf.spec.filters,
      schema: presentUndoableState.dataset.schema,
      fieldDefs: selectSchemaFieldDefs(state),
      specPreview: state.persistent.shelfPreview.spec
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(EncodingPanelBase, styles));
