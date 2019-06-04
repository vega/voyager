import {Schema} from 'compassql/build/src/schema';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {Channel} from 'vega-lite/build/src/channel';
import {FieldOneOfPredicate, FieldRangePredicate} from 'vega-lite/build/src/predicate';
import {FilterAction} from '../../actions';
import {ActionHandler} from '../../actions/index';
import {createDispatchHandler} from '../../actions/redux-action';
import {ResultAsyncAction} from '../../actions/result';
import {ShelfAction} from '../../actions/shelf/index';
import {SPEC_FIELD_ADD} from '../../actions/shelf/spec';
import {Dataset, State} from '../../models';
import {ShelfUnitSpec} from '../../models';
import {VoyagerConfig} from '../../models/config';
import {ShelfFieldDef} from '../../models/shelf';
import {selectConfig, selectDataset} from '../../selectors/';
import {selectSchemaFieldDefs} from '../../selectors/dataset';
import {selectFilters, selectShelfSpec} from '../../selectors/shelf';
import {DataSelector} from '../data-selector';
import {MarkPicker} from '../encoding-pane/mark-picker';
import * as styles from './compact-encoding-pane.scss';

export interface CompactEncodingPaneProps extends ActionHandler<ShelfAction | ResultAsyncAction | FilterAction> {
  spec: ShelfUnitSpec;

  filters: Array<FieldRangePredicate | FieldOneOfPredicate>;

  schema: Schema;

  fieldDefs: ShelfFieldDef[];

  data: Dataset;
  config: VoyagerConfig;
}

export class CompactEncodingPaneBase extends React.PureComponent<CompactEncodingPaneProps, {}> {
  public render() {
    const {name} = this.props.data;
    const {showDataSourceSelector} = this.props.config;

    const channels = ['x', 'y', 'size', 'color', 'shape', 'text', 'row', 'column'];

    return (
      <div className="pane" styleName="data-pane">
        <h2 styleName="data-pane-title">Data</h2>
        <div>
          <span styleName="current-dataset">
            <i className="fa fa-database" /> {name}
          </span>
          <span className="right">{showDataSourceSelector ? <DataSelector title="Change" /> : null}</span>
        </div>
        <div styleName="data-pane-section">
          <div className="right">{this.markPicker()}</div>
          <h3>Mark</h3>
        </div>
        <div styleName="data-pane-section">
          <h3>Encoding</h3>
          {channels.map(this.encodingShelf.bind(this))}
        </div>
      </div>
    );
  }

  private onFieldChange(channel: Channel, field: string) {
    const {schema} = this.props;

    let type = schema.vlType(field);
    if (type === 'key') {
      type = 'nominal';
    }

    this.props.handleAction({
      type: SPEC_FIELD_ADD,
      payload: {
        shelfId: {channel},
        fieldDef: {
          field,
          type
        },
        replace: true
      }
    });
  }

  private fieldSelector(channel: Channel) {
    const {spec, schema} = this.props;
    const {encoding} = spec;

    const options = schema.fieldNames().map(field => {
      const typeString = `(${schema
        .fieldSchema(field)
        .vlType.charAt(0)
        .toUpperCase()})`;

      return (
        <option key={field} value={field}>
          {field} {typeString}
        </option>
      );
    });

    const field = (encoding[channel] || {}).field;

    const onChange = (event: any) => {
      this.onFieldChange(channel, event.target.value);
    };

    return (
      <select value={field} onChange={onChange}>
        <option value={undefined}>-</option>
        {options}
      </select>
    );
  }

  private encodingShelf(channel: Channel) {
    return (
      <div key={channel}>
        <span>{channel}</span>
        {this.fieldSelector(channel)}
      </div>
    );
  }

  private markPicker() {
    const {handleAction, spec} = this.props;
    const {mark} = spec;
    return <MarkPicker mark={mark} handleAction={handleAction} />;
  }
}

export const CompactEncodingPane = connect(
  (state: State) => {
    return {
      data: selectDataset(state),
      config: selectConfig(state),
      spec: selectShelfSpec(state),
      filters: selectFilters(state),
      schema: selectDataset(state).schema,
      fieldDefs: selectSchemaFieldDefs(state)
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(CompactEncodingPaneBase, styles));
