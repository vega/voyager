import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';

import * as styles from './data-pane.scss';

import {ActionHandler, createDispatchHandler, DatasetAsyncAction, ShelfFieldAutoAdd} from '../../actions';
import {DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {Dataset, State} from '../../models';
import {VoyagerConfig} from '../../models/config';
import {selectConfig, selectDataset} from '../../selectors/';
import {DataSelector} from './data-selector';
import {FieldList, PresetWildcardFieldList} from './field-list';

export interface DataPanelProps extends ActionHandler<DatasetAsyncAction | ShelfFieldAutoAdd |
  DatasetSchemaChangeFieldType> {
  data: Dataset;
  config: VoyagerConfig;
}

export class DataPanelBase extends React.PureComponent<DataPanelProps, {}> {
  public render() {
    const {name} = this.props.data;
    const fieldCount = this.props.data.schema.fieldSchemas.length;
    const {showDataSourceSelector} = this.props.config;

    const dataName = (
      <div>Name: {name}</div>
    );

    const fields = fieldCount > 0 ? (
      <div styleName="data-pane-section">
        <h3>Fields</h3>
        <FieldList/>
      </div>) : null;

    const wildcardFields = fieldCount > 0 ? (
      <div styleName="data-pane-section">
        <h3>Wildcard Fields</h3>
        <PresetWildcardFieldList/>
      </div>
    ) : null;
    return (
      <div className="pane" styleName="data-pane">
        <h2>Data</h2>
        {showDataSourceSelector ? <DataSelector /> : dataName}
        {fields}
        {wildcardFields}
      </div>
    );
  }
}

export const DataPane = connect(
  (state: State) => {
    return {
      data: selectDataset(state),
      config: selectConfig(state)
    };
  },
  createDispatchHandler<DatasetAsyncAction>()
)(CSSModules(DataPanelBase, styles));
