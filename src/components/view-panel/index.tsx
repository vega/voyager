import {Query} from 'compassql/build/src/query/query';
import * as React from 'react';
import {connect} from 'react-redux';
import {State, toQuery} from '../../models';
import {getQuery, getMainSpec} from '../../selectors';
import {ExtendedUnitSpec} from 'vega-lite/src/spec';

export interface ViewPanelProps {
  query: Query;
  mainSpec: ExtendedUnitSpec
}

class ViewPanelBase extends React.PureComponent<ViewPanelProps, {}> {
  public render() {
    return (
      <div className="view">
        <h2>Specified View</h2>
        {JSON.stringify(this.props.query)}

        {JSON.stringify(this.props.mainSpec)}
      </div>
    );
  }
}
export const ViewPanel = connect(
  (state: State) => {
    return {
      query: getQuery(state),
      mainSpec: getMainSpec(state)
    };
  }
)(ViewPanelBase);
