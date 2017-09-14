import {Schema} from 'compassql/build/src/schema';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {CustomWildcardAction} from '../../actions/custom-wildcard-field';
import {ActionHandler} from '../../actions/redux-action';
import {Dataset, State} from '../../models';
import {VoyagerConfig} from '../../models/config';
import {CustomWildcardFieldDef} from '../../models/custom-wildcard-field';
import {selectConfig, selectDataset} from '../../selectors/';
import {selectSchema} from '../../selectors/dataset';
import {selectCustomWildcardFieldDefs} from '../../selectors/index';
import {DataSelector} from '../data-selector';
import * as styles from './data-pane.scss';
import {CustomWildcardFieldList, FieldList, PresetWildcardFieldList} from './field-list';
import {CustomWildcardFieldDropZone} from './wildcard-field-drop-zone';

export interface DataPanelProps extends ActionHandler<CustomWildcardAction> {
  config: VoyagerConfig;
  customWildcardFieldDefs: CustomWildcardFieldDef[];
  data: Dataset;
  schema: Schema;
}

export class DataPaneBase extends React.PureComponent<DataPanelProps, {}> {
  public render() {
    const {schema, handleAction} = this.props;
    const {name} = this.props.data;
    const fieldCount = this.props.data.schema.fieldSchemas.length;
    const {showDataSourceSelector, manualSpecificationOnly} = this.props.config;

    const fields = fieldCount > 0 ? (
      <div styleName="data-pane-section">
        <h3>Fields</h3>
        <FieldList/>
      </div>) : null;

    const wildcardFields = !manualSpecificationOnly && fieldCount > 0 && (
      <div styleName="data-pane-section">
        <h3>Wildcard Fields</h3>
        <PresetWildcardFieldList/>
        <CustomWildcardFieldList/>
        <CustomWildcardFieldDropZone
          schema={schema}
          handleAction={handleAction}
        />
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
      config: selectConfig(state),
      customWildcardFieldDefs: selectCustomWildcardFieldDefs(state),
      data: selectDataset(state),
      schema: selectSchema(state)
    };
  }
)(CSSModules(DataPaneBase, styles));
