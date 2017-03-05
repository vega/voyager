import {Query} from 'compassql/build/src/query/query';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {FacetedUnitSpec} from 'vega-lite/build/src/spec';

import {State} from '../../models';
import {getMainSpec, getQuery} from '../../selectors';
import {VegaLite} from '../vega-lite/index';
import * as styles from './index.scss';

export interface ViewPanelProps {
  query: Query;
  mainSpec: FacetedUnitSpec;
}

class ViewPanelBase extends React.PureComponent<ViewPanelProps, {}> {
  public render() {
    return (
      <div className="pane" styleName="view-pane">
        <h2>Specified View</h2>
        <VegaLite spec={this.props.mainSpec}/>

        {JSON.stringify(this.props.query)}

        {JSON.stringify(this.props.mainSpec)}


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
)(CSSModules(ViewPanelBase, styles));
