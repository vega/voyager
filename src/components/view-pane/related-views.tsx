import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {BookmarkAction} from '../../actions/bookmark';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {ResultAction} from '../../actions/result';
import {ShelfAction} from '../../actions/shelf';
import {Bookmark} from '../../models/bookmark';
import {State} from '../../models/index';
import {ResultPlot} from '../../models/result';
import {RESULT_TYPES, ResultType} from '../../models/result';
import {RELATED_VIEWS_INDEX, RELATED_VIEWS_TYPES} from '../../queries/index';
import {selectBookmark} from '../../selectors/index';
import {selectPlotList, selectResultLimit} from '../../selectors/result';
import {PlotList} from '../plot-list/index';
import * as styles from './related-views.scss';

export interface RelatedViewsProps extends ActionHandler<BookmarkAction|ShelfAction|ResultAction> {
  plotsIndex: {
    [k in ResultType]: ResultPlot[]
  };

  resultLimitIndex: {
    [k in ResultType]: number
  };

  bookmark: Bookmark;
}

export class RelatedViewsBase extends React.PureComponent<RelatedViewsProps, {}> {
  public render() {
    const {bookmark, handleAction, plotsIndex, resultLimitIndex} = this.props;

    const subpanes = RELATED_VIEWS_TYPES.map(relatedViewType => {
      const plots = plotsIndex[relatedViewType];
      const title = RELATED_VIEWS_INDEX[relatedViewType].title;
      const limit = resultLimitIndex[relatedViewType];

      return (
        plots && plots.length > 0 &&
        <div styleName="related-views-subpane" key={relatedViewType}>
          <h3>{title}</h3>
          <PlotList
            handleAction={handleAction}
            plots={plots}
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
      plotsIndex: RESULT_TYPES.reduce((index, resultType) => {
        index[resultType] = selectPlotList[resultType](state);
        return index;
      }, {}),
      resultLimitIndex: RESULT_TYPES.reduce((index, resultType) => {
        index[resultType] = selectResultLimit[resultType](state);
        return index;
      }, {}),
      bookmark: selectBookmark(state)
    };
  },
  createDispatchHandler<BookmarkAction|ShelfAction>()
)(CSSModules(RelatedViewsBase, styles));
