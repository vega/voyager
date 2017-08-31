import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {BookmarkAction} from '../../actions/bookmark';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ResultAction} from '../../actions/result';
import {ShelfAction} from '../../actions/shelf';
import {SHELF_PREVIEW_DISABLE, SHELF_PREVIEW_QUERY, ShelfPreviewAction} from '../../actions/shelf-preview';
import {SHELF_LOAD_QUERY} from '../../actions/shelf/index';
import {Bookmark} from '../../models/bookmark';
import {State} from '../../models/index';
import {Result, RESULT_TYPES, ResultType} from '../../models/result';
import {RELATED_VIEWS_INDEX, RELATED_VIEWS_TYPES} from '../../queries/index';
import {selectBookmark} from '../../selectors/index';
import {selectResult} from '../../selectors/result';
import {PlotList} from '../plot-list/index';
import * as styles from './related-views.scss';

export interface RelatedViewsProps extends ActionHandler<BookmarkAction|ShelfAction|ShelfPreviewAction|ResultAction> {
  results: {
    [k in ResultType]: Result
  };

  bookmark: Bookmark;
}

export class RelatedViewsBase extends React.PureComponent<RelatedViewsProps, {}> {
  public render() {
    const {bookmark, handleAction, results} = this.props;

    const subpanes = RELATED_VIEWS_TYPES.map(relatedViewType => {
      const title = RELATED_VIEWS_INDEX[relatedViewType].title;
      const result = results[relatedViewType];
      const {isLoading, plots} = result;
      return (
        (isLoading || plots && plots.length > 0) && <div styleName="related-views-subpane" key={relatedViewType}>
          <div>
            <h3>
              {title}
            </h3>
            {
              relatedViewType !== 'histograms' &&
              <i
                title='Specify'
                styleName='command'
                className="fa fa-server"
                onClick={this.onSpecify.bind(this, relatedViewType)}
                onMouseEnter={this.onPreviewMouseEnter.bind(this, relatedViewType)}
                onMouseLeave={this.onPreviewMouseLeave.bind(this, relatedViewType)}
              />
            }
          </div>

          <PlotList
            handleAction={handleAction}
            bookmark={bookmark}
            resultType={relatedViewType}
            result={result}
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

  private onSpecify(relatedViewType: ResultType) {
    const {handleAction, results} = this.props;
    const query = results[relatedViewType].query;
    handleAction({
      type: SHELF_LOAD_QUERY,
      payload: {query}
    });
  }

  private onPreviewMouseEnter(relatedViewType: ResultType) {
    const {handleAction, results} = this.props;
    const query = results[relatedViewType].query;
    handleAction({
      type: SHELF_PREVIEW_QUERY,
      payload: {query}
    });
  }

  private onPreviewMouseLeave(relatedViewType: ResultType) {
    const {handleAction} = this.props;
    handleAction({type: SHELF_PREVIEW_DISABLE});
  }
}


export const RelatedViews = connect(
  (state: State) => {
    return {
      results: RESULT_TYPES.reduce((results, resultType) => {
        results[resultType] = selectResult[resultType](state);
        return results;
      }, {}),
      bookmark: selectBookmark(state)
    };
  },
  createDispatchHandler<BookmarkAction|ShelfAction>()
)(CSSModules(RelatedViewsBase, styles));
