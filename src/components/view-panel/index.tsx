import {SpecQuery} from 'compassql/src/query/spec';
import * as React from 'react';
import {connect} from 'react-redux';
import {State, toSpecQuery} from '../../models';

export interface ViewPanelProps {
  specQuery: SpecQuery;
}

class ViewPanelBase extends React.Component<ViewPanelProps, {}> {
  public render() {
    return (
      <div className="view">
        <h2>Specified View</h2>
        {JSON.stringify(this.props.specQuery)}
      </div>
    );
  }
}
export const ViewPanel = connect(
  (state: State) => {
    // FIXME: use reselect
    const specQuery = toSpecQuery(state.shelf);
    return {specQuery: specQuery};
  }
)(ViewPanelBase);
