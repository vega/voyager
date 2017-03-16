import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';

import * as styles from './data-pane.scss';

import {ActionHandler, createDispatchHandler, DatasetAsyncAction, ShelfFieldAutoAdd} from '../../actions';
import {Dataset, ShelfFieldDef, State} from '../../models';
import {DatasetSelector} from './dataset-selector';
import {FieldList} from './field-list';

export interface DataPanelProps extends ActionHandler<DatasetAsyncAction | ShelfFieldAutoAdd> {
  data: Dataset;
}

export class DataPanelBase extends React.PureComponent<DataPanelProps, {}> {
  public render() {
    const {handleAction} = this.props;
    const {name, schema} = this.props.data;

    const schemaFieldDefs = schema.fieldSchemas.map(fieldSchema => {
      const {field, type} = fieldSchema;
      return {field, type};
    });

    const presetWildcardFieldDefs: ShelfFieldDef[] = [
      {field: SHORT_WILDCARD, type: 'quantitative', title: 'Quantitative Fields'},
      {field: SHORT_WILDCARD, type: 'nominal', title: 'Categorical Fields'},
      // TODO: only show temporal if the dataset contains temporal
      {field: SHORT_WILDCARD, type: 'temporal', title: 'Temporal Fields'},
    ];

    return (
      <div className="pane" styleName="data-pane">
        <h2>Data</h2>
        <DatasetSelector name={name} handleAction={handleAction}/>
        <div>Name: {name}</div>

        <h3>Fields</h3>
        <FieldList fieldDefs={schemaFieldDefs} handleAction={handleAction}/>

        <h3>Wildcard Fields</h3>
        <FieldList fieldDefs={presetWildcardFieldDefs} handleAction={handleAction}/>
      </div>
    );
  }
}

export const DataPane = connect(
  (state: State) => {
    return {data: state.present.dataset};
  },
  createDispatchHandler<DatasetAsyncAction>()
)(CSSModules(DataPanelBase, styles));
