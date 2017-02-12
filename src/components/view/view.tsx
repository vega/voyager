import * as React from 'react';

import {SpecQuery} from 'compassql/src/query/spec';

export interface ViewProp {
  specQuery: SpecQuery;
}

export class View extends React.Component<ViewProp, {}> {
  public render() {
    return (
      <div className="view">
        <h2>Specified View</h2>
        {JSON.stringify(this.props.specQuery)}
      </div>
    );
  }
}
