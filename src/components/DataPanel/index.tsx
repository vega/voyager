import * as React from 'react';
import {connect} from 'react-redux';

import {Data, State} from '../../models';
import {FieldList} from './fieldlist';

export interface DataPanelProps {
  data: Data;
}

export class DataPanelBase extends React.Component<DataPanelProps, {}> {
  public render() {
    const {name, schema} = this.props.data;

    return (
      <div className="data-pane">
        <h2>Data</h2>
        <div>Name: {name}</div>
        <FieldList schema={schema}/>
      </div>
    );
  }
}

export const DataPanel = connect(
  (state: State) => {
    // FIXME: use reselect
    return {data: state.data};
  }
)(DataPanelBase);
