import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {State} from '../../models';
import {Bookmark} from '../../models/bookmark';
import {PlotObject} from '../../models/plot';
import {selectBookmark, selectMainSpec, selectPlotList} from '../../selectors';
import {Plot} from '../plot';
import {PlotList} from '../plot-list';
import {RelatedViews} from './related-views';
import * as styles from './view-pane.scss';

export interface ViewPaneProps extends ActionHandler<ShelfAction> {
  isQuerySpecific: boolean;
  spec: FacetedCompositeUnitSpec;
  plots: PlotObject[];
  bookmark: Bookmark;
}

class ViewPaneBase extends React.PureComponent<ViewPaneProps, {}> {
  public render() {
    const {bookmark, handleAction, spec, plots} = this.props;

    if (spec) {
      return (
        <div styleName="view-pane">
          <div className="pane" styleName="view-pane-specific">
            <h2>Specified View</h2>
            <Plot handleAction={handleAction} spec={spec} showBookmarkButton={true} bookmark={bookmark}/>
          </div>

          <div className="pane" styleName="view-pane-related-views">
            <h2>Related Views</h2>
            <RelatedViews/>
          </div>
        </div>
      );
    } else if (plots) {
      return (
        <div className="pane" styleName="view-pane-gallery">
          <h2>Specified Views</h2>
          <PlotList handleAction={handleAction} plots={plots} bookmark={bookmark}/>
        </div>
      );
    } else {
      // if there are no results, then nothing to render.
      return null;
    }
  }
}
export const ViewPane = connect(
  (state: State) => {
    return {
      plots: selectPlotList.main(state),
      spec: selectMainSpec(state),
      bookmark: selectBookmark(state)
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(ViewPaneBase, styles));
