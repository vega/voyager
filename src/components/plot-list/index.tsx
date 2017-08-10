import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ActionHandler} from '../../actions/redux-action';
import {RESULT_LIMIT_INCREASE, ResultAction} from '../../actions/result';
import {ShelfAction} from '../../actions/shelf';
import {Bookmark} from '../../models/bookmark';
import {PlotObject} from '../../models/plot';
import {ResultType} from '../../models/result';
import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListProps extends ActionHandler<ShelfAction|ResultAction> {
  plots: PlotObject[];

  resultType?: ResultType;

  bookmark: Bookmark;

  limit?: number;
}

export class PlotListBase extends React.PureComponent<PlotListProps, any> {
  constructor(props: PlotListProps) {
    super(props);

    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  public render() {
    const {plots, handleAction, bookmark, limit} = this.props;
    const plotListItems = plots.slice(0, limit).map(plot => {
      const {spec, fieldInfos} = plot;
      return (
        <Plot
          key={JSON.stringify(spec)}
          fieldInfos={fieldInfos}
          handleAction={handleAction}
          isPlotListItem={true}
          showBookmarkButton={true}
          showSpecifyButton={true}
          spec={spec}
          bookmark={bookmark}
        />
      );
    });

    return (
      <div>
        <div styleName="plot-list">
          {plotListItems}
        </div>
        {plots.length > limit && (
          <a styleName="load-more" onClick={this.handleLoadMore}>
            Load more...
          </a>
        )}
      </div>
    );
  }
  private handleLoadMore() {
    const {handleAction, resultType} = this.props;
    handleAction({
      type: RESULT_LIMIT_INCREASE,
      payload: {
        resultType,
        increment: 4
      }
    });
  }
}

export const PlotList = CSSModules(PlotListBase, styles);
