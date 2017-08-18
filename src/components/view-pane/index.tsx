import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {SortField, SortOrder} from 'vega-lite/build/src/sort';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {SPEC_FIELD_PROP_CHANGE} from '../../actions/shelf/spec';
import {State} from '../../models';
import {Bookmark} from '../../models/bookmark';
import {ResultPlot} from '../../models/result';
import {selectBookmark, selectMainSpec, selectPlotList} from '../../selectors';
import {selectResultLimit} from '../../selectors/result';
import {selectIsQuerySpecific} from '../../selectors/shelf';
import {Plot} from '../plot';
import {PlotList} from '../plot-list';
import {RelatedViews} from './related-views';
import * as styles from './view-pane.scss';

export interface ViewPaneProps extends ActionHandler<ShelfAction> {
  isQuerySpecific: boolean;
  spec: FacetedCompositeUnitSpec;
  plots: ResultPlot[];
  bookmark: Bookmark;
  mainLimit: number;
}

const NO_PLOT_MESSAGE = `No specified visualization yet. ` +
`Start exploring by dragging a field to encoding pane ` +
`on the left or examining univariate summaries below.`;

class ViewPaneBase extends React.PureComponent<ViewPaneProps, {}> {

  constructor(props: ViewPaneProps) {
    super(props);
    this.onSort = this.onSort.bind(this);
  }

  public render() {
    const {bookmark, isQuerySpecific, handleAction, mainLimit, plots} = this.props;

    if (isQuerySpecific) {
      return (
        <div styleName="view-pane">
          <div className="pane" styleName="view-pane-specific">
            <h2>Specified View</h2>
            {this.renderSpecifiedView()}
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
          <PlotList resultType="main" handleAction={handleAction} plots={plots} bookmark={bookmark} limit={mainLimit}/>
        </div>
      );
    } else {
      // if there are no results, then nothing to render.
      return null;
    }
  }

  private onSort(channel: 'x' | 'y', value: SortOrder | SortField) {
    const {handleAction} = this.props;
    handleAction({
      type: SPEC_FIELD_PROP_CHANGE,
      payload: {
        shelfId: {channel},
        prop: 'sort',
        value
      }
    });
  }

  private renderSpecifiedView() {
    const {bookmark, handleAction, spec} = this.props;

    if (spec) {
      return (
        <Plot
          bookmark={bookmark}
          handleAction={handleAction}
          onSort={this.onSort}
          showBookmarkButton={true}
          spec={spec}
        />
      );
    } else {
      return (
         <span>{NO_PLOT_MESSAGE}</span>
      );
    }
  }
}
export const ViewPane = connect(
  (state: State) => {
    return {
      isQuerySpecific: selectIsQuerySpecific(state),
      plots: selectPlotList.main(state),
      spec: selectMainSpec(state),
      bookmark: selectBookmark(state),
      mainLimit: selectResultLimit.main(state)
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(ViewPaneBase, styles));
