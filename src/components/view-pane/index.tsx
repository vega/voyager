import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {State} from '../../models';
import {Bookmark} from '../../models/bookmark';
import {PlotObject} from '../../models/plot';
import {selectBookmark, selectMainResultForView} from '../../selectors';
import {Plot} from '../plot';
import {PlotList} from '../plot-list';
import * as styles from './view-pane.scss';

export interface ViewPaneProps extends ActionHandler<ShelfAction> {
  mainResult: {
    spec: FacetedCompositeUnitSpec,
    plots: PlotObject[]
  };
  bookmark: Bookmark;
}

class ViewPaneBase extends React.PureComponent<ViewPaneProps, {}> {
  public render() {
    const {bookmark, handleAction, mainResult} = this.props;

    // if there are no results, then nothing to render.
    if (!mainResult) {
      return null;
    }

    if (mainResult.spec) {
      return (
        <div className="pane" styleName="view-pane-specific">
          <h2>Specified View</h2>
          <Plot handleAction={handleAction} spec={mainResult.spec} showBookmarkButton={true} bookmark={bookmark}/>

          {/*{JSON.stringify(this.props.query)}

          {JSON.stringify(this.props.mainSpec)}*/}
        </div>
      );
    } else {
      return (
        <div className="pane" styleName="view-pane-gallery">
          <h2>Specified Views</h2>
          <PlotList handleAction={handleAction} plots={mainResult.plots} bookmark={bookmark}/>
        </div>
      );
    }
  }
}
export const ViewPane = connect(
  (state: State) => {
    return {
      // FIXME: refactor the flow for this part (we should support asynchrounous request for this too)
      mainResult: selectMainResultForView(state),
      bookmark: selectBookmark(state)
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(ViewPaneBase, styles));
