import {Query} from 'compassql/build/src/query/query';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {FacetedUnitSpec} from 'vega-lite/build/src/spec';

import {State} from '../../models';
import {getMainSpec, getQuery} from '../../selectors';
import {Plot} from '../plot';
import * as styles from './view-pane.scss';

export interface ViewPaneProps {
  query: Query;
  mainSpec: FacetedUnitSpec;
}

class ViewPaneBase extends React.PureComponent<ViewPaneProps, {}> {
  public render() {
    return (
      <div className="pane" styleName="view-pane">
        <h2>Specified View</h2>
        <Plot spec={this.props.mainSpec}/>

        {/*{JSON.stringify(this.props.query)}

        {JSON.stringify(this.props.mainSpec)}*/}
      </div>
    );
  }
}
export const ViewPane = connect(
  (state: State) => {
    return {
      query: getQuery(state),
      mainSpec: getMainSpec(state)
    };
  }
)(CSSModules(ViewPaneBase, styles));
