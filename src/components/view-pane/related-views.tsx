import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {BookmarkAction} from '../../actions/bookmark';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ResultAction} from '../../actions/result';
import {ShelfAction} from '../../actions/shelf';
import {Bookmark} from '../../models/bookmark';
import {State} from '../../models/index';
import {PlotObject} from '../../models/plot';
import {Result, RESULT_TYPES, ResultType} from '../../models/result';
import {RELATED_VIEWS_INDEX, RELATED_VIEWS_TYPES} from '../../queries/index';
import {selectBookmark} from '../../selectors/index';
import {selectPlotList, selectResult} from '../../selectors/result';
import {PlotList} from '../plot-list/index';
import * as styles from './related-views.scss';

export interface RelatedViewsProps extends ActionHandler<BookmarkAction|ShelfAction|ResultAction> {
  plots: {
    [k in ResultType]: PlotObject[]
  };

  results: {
    [k in ResultType]: Result
  };

  bookmark: Bookmark;
}

export class RelatedViewsBase extends React.PureComponent<RelatedViewsProps, {}> {
  public render() {
    const {bookmark, handleAction, plots, results} = this.props;

    const subpanes = RELATED_VIEWS_TYPES.map(relatedViewType => {
      const plotObjects = plots[relatedViewType];
      const title = RELATED_VIEWS_INDEX[relatedViewType].title;
      const {limit} = results[relatedViewType];
      return (
        plotObjects && plotObjects.length > 0 &&
        <div styleName="related-views-subpane" key={relatedViewType}>
          <h3>{title}</h3>
          <PlotList
            handleAction={handleAction}
            plots={plotObjects}
            bookmark={bookmark}
            limit={limit}
            resultType={relatedViewType}
          />
        </div>
      );
    });

    return (
      <div>
        {subpanes}
      </div>
    );
  }
}


export const RelatedViews = connect(
  (state: State) => {
    return {
      plots: RESULT_TYPES.reduce((plots, resultType) => {
        plots[resultType] = selectPlotList[resultType](state);
        return plots;
      }, {}),
      results: RESULT_TYPES.reduce((results, resultType) => {
        results[resultType] = selectResult[resultType](state);
        return results;
      }, {}),
      bookmark: selectBookmark(state)
    };
  },
  createDispatchHandler<BookmarkAction|ShelfAction>()
)(CSSModules(RelatedViewsBase, styles));
