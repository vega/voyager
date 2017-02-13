import * as React from 'react';
import {Data} from '../../models';

import {FieldList} from './fieldlist';

export interface DataPanelProps {
  data: Data;
}

export class DataPanel extends React.Component<DataPanelProps, {}> {
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
