import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';

import * as styles from './data-pane.scss';

import {ActionHandler, createDispatchHandler, DatasetAsyncAction, ShelfFieldAutoAdd} from '../../actions';
import {Dataset, State} from '../../models';

import {DatasetSelector} from './dataset-selector';
import {FieldList} from './field-list';

export interface DataPanelProps extends ActionHandler<DatasetAsyncAction | ShelfFieldAutoAdd> {
  data: Dataset;
}

export class DataPanelBase extends React.PureComponent<DataPanelProps, {}> {
  public render() {
    const {handleAction} = this.props;
    const {name, schema} = this.props.data;

    const fieldDefs = schema.fieldSchemas.map(fieldSchema => {
      const {field, type} = fieldSchema;
      return {field, type};
    });

    return (
      <div className="pane" styleName="data-pane">
        <h2>Data</h2>
        <DatasetSelector name={name} handleAction={handleAction}/>
        <div>Name: {name}</div>

        <h3>Fields</h3>
        <FieldList fieldDefs={fieldDefs} handleAction={handleAction}/>
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
