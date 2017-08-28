import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {SortField, SortOrder} from 'vega-lite/build/src/sort';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {SHELF_AUTO_ADD_COUNT_CHANGE, SHELF_GROUP_BY_CHANGE} from '../../actions/shelf/index';
import {SPEC_FIELD_PROP_CHANGE} from '../../actions/shelf/spec';
import {State} from '../../models';
import {Bookmark} from '../../models/bookmark';
import {VoyagerConfig} from '../../models/config';
import {Result} from '../../models/result/index';
import {SHELF_GROUP_BYS, ShelfGroupBy} from '../../models/shelf/index';
import {selectBookmark, selectConfig, selectMainSpec} from '../../selectors';
import {selectResult} from '../../selectors/result';
import {selectAutoAddCount, selectDefaultGroupBy, selectIsQuerySpecific, selectShelf} from '../../selectors/shelf';
import {Plot} from '../plot';
import {PlotList} from '../plot-list';
import {RelatedViews} from './related-views';
import * as styles from './view-pane.scss';

export interface ViewPaneProps extends ActionHandler<ShelfAction> {
  isQuerySpecific: boolean;
  spec: FacetedCompositeUnitSpec;
  result: Result;
  bookmark: Bookmark;
  autoAddCount: boolean;

  groupBy: ShelfGroupBy;
  defaultGroupBy: ShelfGroupBy;
  config: VoyagerConfig;
}

const NO_PLOT_MESSAGE = `No specified visualization yet. ` +
`Start exploring by dragging a field to encoding pane ` +
`on the left or examining univariate summaries below.`;

const GROUP_BY_LABEL: {[K in ShelfGroupBy]: string} = {
  auto: 'Automatic',
  field: 'Field',
  fieldTransform: 'Field and Transformations',
  encoding: 'Visual Encodings'
};

class ViewPaneBase extends React.PureComponent<ViewPaneProps, {}> {

  constructor(props: ViewPaneProps) {
    super(props);
    this.onSort = this.onSort.bind(this);

    this.onAutoAddCountChange = this.onAutoAddCountChange.bind(this);
    this.onGroupByChange = this.onGroupByChange.bind(this);
  }

  public render() {
    const {isQuerySpecific} = this.props;
    const {manualSpecificationOnly} = this.props.config;

    const relatedViews = !manualSpecificationOnly && (
      <div className="pane" styleName="view-pane-related-views">
        <h2>Related Views</h2>
        <RelatedViews/>
      </div>
    );


    if (isQuerySpecific) {
      return (
        <div styleName="view-pane">
          <div className="pane" styleName="view-pane-specific">
            <h2>Specified View</h2>
            {this.renderSpecifiedView()}
          </div>
          {relatedViews}
        </div>
      );
    } else {
      return this.renderSpecifiedViews();
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

  private renderSpecifiedViews() {
    const {bookmark, handleAction, autoAddCount, groupBy, defaultGroupBy, result} = this.props;

    const options = SHELF_GROUP_BYS.map(value => {
      const label = value === 'auto' ?
        `${GROUP_BY_LABEL[defaultGroupBy]} (Automatic)` :
        GROUP_BY_LABEL[value];
      return (
        <option value={value} key={value}>
          {label}
        </option>
      );
    });
    return (
      <div className="pane" styleName="view-pane-gallery">
        <div className="right">
          <label styleName="gallery-command">
            Showing views with different
            {' '}
            <select value={groupBy} onChange={this.onGroupByChange}>
              {options}
            </select>
          </label>

          <label styleName="gallery-command">
            <input
              type="checkbox"
              checked={autoAddCount}
              onChange={this.onAutoAddCountChange}
            />
            {' '}
            Auto Add Count
          </label>
        </div>

        <h2>Specified Views</h2>
        <PlotList
          result={result}
          resultType="main"
          handleAction={handleAction}
          bookmark={bookmark}
        />
      </div>
    );
  }

  private onAutoAddCountChange(event: any) {
    const autoAddCount = event.target.checked;
    const {handleAction} = this.props;
    handleAction({
      type: SHELF_AUTO_ADD_COUNT_CHANGE,
      payload: {autoAddCount}
    });
  }

  private onGroupByChange(event: any) {
    const {handleAction} = this.props;
    handleAction({
      type: SHELF_GROUP_BY_CHANGE,
      payload: {groupBy: event.target.value}
    });
  }
}
export const ViewPane = connect(
  (state: State) => {
    return {
      isQuerySpecific: selectIsQuerySpecific(state),
      bookmark: selectBookmark(state),
      spec: selectMainSpec(state),
      result: selectResult.main(state),
      autoAddCount: selectAutoAddCount(state),
      groupBy: selectShelf(state).groupBy,
      defaultGroupBy: selectDefaultGroupBy(state),
      config: selectConfig(state)
    };
  },
  createDispatchHandler<ShelfAction>()
)(CSSModules(ViewPaneBase, styles));
