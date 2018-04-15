import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {Dataset, State} from '../../models';
import {VoyagerConfig} from '../../models/config';
import {selectConfig, selectDataset} from '../../selectors/';
import {DataSelector} from '../data-selector';
import * as styles from './data-pane.scss';
import {FieldList, PresetWildcardFieldList} from './field-list';

export interface DataPanelProps {
  data: Dataset;
  config: VoyagerConfig;
}

export class DataPaneBase extends React.PureComponent<DataPanelProps, {}> {
  public render() {
    const {name} = this.props.data;
    const fieldCount = this.props.data.schema.fieldSchemas.length;
    const {showDataSourceSelector, wildcards} = this.props.config;

    const fields = fieldCount > 0 ? (
      <div styleName="data-pane-section">
        <h3>Fields</h3>
        <FieldList/>
      </div>) : null;

    const wildcardFields = wildcards !== 'disabled' && fieldCount > 0 && (
      <div styleName="data-pane-section">
        <h3>Wildcard Fields</h3>
        <PresetWildcardFieldList/>
      </div>
    );
    return (
      <div className="pane" styleName="data-pane">
        <h2 styleName="data-pane-title">Data</h2>
        <div>
          <span styleName="current-dataset">
            <i className="fa fa-database"/>
            {' '}
            {name}
          </span>
          <span className="right">
            {showDataSourceSelector ? <DataSelector title="Change"/> : null}
          </span>
        </div>
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
  }
)(CSSModules(DataPaneBase, styles));
