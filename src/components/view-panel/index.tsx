import {SpecQuery} from 'compassql/build/src/query/spec';
import * as React from 'react';
import {connect} from 'react-redux';
import {State, toSpecQuery} from '../../models';
import {getSpecQuery} from '../../selectors';

export interface ViewPanelProps {
  specQuery: SpecQuery;
}

class ViewPanelBase extends React.PureComponent<ViewPanelProps, {}> {
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
    return {specQuery: getSpecQuery(state)};
  }
)(ViewPanelBase);
