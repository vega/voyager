import {SpecQueryModel, SpecQueryModelGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {Data} from 'vega-lite/build/src/data';

import {State} from '../../models';
import {hasWildcards} from '../../models/shelf/spec';
import {getData, getMainResult, getQuery} from '../../selectors';
import {Plot} from '../plot';
import {PlotList} from '../plot-list';
import * as styles from './view-pane.scss';

export interface ViewPaneProps {
  data: Data;
  query: Query;
  mainResult: SpecQueryModelGroup;
}

class ViewPaneBase extends React.PureComponent<ViewPaneProps, {}> {
  public render() {
    const {data, query, mainResult} = this.props;
    const isSpecific = !hasWildcards(query.spec).hasAnyWildcard;

    if (isSpecific) {
      const spec = {
        // FIXME: include data in the main spec?
        data: data,
        ...mainResult.getTopSpecQueryModel().toSpec()
      };

      return (
        <div className="pane" styleName="view-pane-specific">
          <h2>Specified View</h2>
          <Plot spec={spec}/>

          {/*{JSON.stringify(this.props.query)}

          {JSON.stringify(this.props.mainSpec)}*/}
        </div>
      );
    } else {
      const specs = mainResult.items.map(item => {
        // FIXME if (item instanceof SpecQueryModelGroup) {
        if ('getTopSpecQueryModel' in item) {
          const modelGroup = item as SpecQueryModelGroup;
          // FIXME: include data in the main spec?
          return {data, ...modelGroup.getTopSpecQueryModel().toSpec()};
        }
        // FIXME: include data in the main spec?
        const model = item as SpecQueryModel;
        return {data, ...model.toSpec()};
      });

      return (
        <div className="pane" styleName="view-pane-gallery">
          <h2>Specified Views</h2>
          <PlotList specs={specs}/>
        </div>
      );
    }
  }
}
export const ViewPane = connect(
  (state: State) => {
    return {
      data: getData(state),
      query: getQuery(state),

      // FIXME: refactor the flow for this part (we should support asynchrounous request for this too)
      mainResult: getMainResult(state)
    };
  }
)(CSSModules(ViewPaneBase, styles));
