import * as React from 'react';
import {connect} from 'react-redux';

import {ActionHandler, createDispatchHandler, DatasetAsyncAction} from '../../actions';
import {Dataset, State} from '../../models';

import {DatasetSelector} from './dataset-selector';
import {FieldList} from './field-list';

export interface DataPanelProps extends ActionHandler<DatasetAsyncAction> {
  data: Dataset;
}

export class DataPanelBase extends React.PureComponent<DataPanelProps, {}> {
  public render() {
    const {name, schema} = this.props.data;

    return (
      <div className="data-pane">
        <h2>Data</h2>
        <DatasetSelector name={name} handleAction={this.props.handleAction}/>
        <div>Name: {name}</div>
        <FieldList schema={schema}/>
      </div>
    );
  }
}

export const DataPanel = connect(
  (state: State) => {
    return {data: state.present.dataset};
  },
  createDispatchHandler<DatasetAsyncAction>()
)(DataPanelBase);
