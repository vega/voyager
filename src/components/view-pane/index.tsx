import {getTopSpecQueryItem, SpecQueryGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {Data} from 'vega-lite/build/src/data';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {State} from '../../models';
import {extractPlotObjects, PlotObject} from '../../models/plot';
import {Logger} from '../../models/shelf/logger';
import {getTransforms, hasWildcards} from '../../models/shelf/spec';
import {getData, getFilters, getMainResult, getQuery} from '../../selectors';
import {getLogger} from '../../selectors/index';
import {Plot} from '../plot';
import {PlotList} from '../plot-list';
import * as styles from './view-pane.scss';

export interface ViewPaneProps extends ActionHandler<ShelfAction> {
  data: Data;
  query: Query;
  filters: Array<RangeFilter | OneOfFilter>;
  mainResult: SpecQueryGroup<PlotObject>;
  logger: Logger;
}

class ViewPaneBase extends React.PureComponent<ViewPaneProps, {}> {
  public render() {
    const {data, handleAction, filters, query, mainResult, logger} = this.props;
    const isSpecific = !hasWildcards(query.spec).hasAnyWildcard;

    // if there are no results, then nothing to render.
    if (!mainResult) {
      return null;
    }

    if (isSpecific) {
      const spec = {
        // FIXME: include data in the main spec?
        data: data,
        transform: getTransforms(filters),
        ...getTopSpecQueryItem(mainResult).spec
      };

      return (
        <div className="pane" styleName="view-pane-specific">
          <h2>Specified View</h2>
          <Plot handleAction={handleAction} spec={spec} logger={logger}/>

          {/*{JSON.stringify(this.props.query)}

          {JSON.stringify(this.props.mainSpec)}*/}
        </div>
      );
    } else {
      const plots = extractPlotObjects(mainResult);

      return (
        <div className="pane" styleName="view-pane-gallery">
          <h2>Specified Views</h2>
          <PlotList handleAction={handleAction} plots={plots} logger={logger}/>
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
      filters: getFilters(state),
      // FIXME: refactor the flow for this part (we should support asynchrounous request for this too)
      mainResult: getMainResult(state),
      logger: getLogger(state)
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(ViewPaneBase, styles));
