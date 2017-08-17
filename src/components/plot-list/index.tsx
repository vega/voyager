import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {SortField, SortOrder} from 'vega-lite/build/src/sort';
import {ActionHandler} from '../../actions/redux-action';
import {
  RESULT_LIMIT_INCREASE, RESULT_MODIFY_FIELD_PROP,
  ResultAction, ResultModifyFieldProp
} from '../../actions/result';
import {ShelfAction} from '../../actions/shelf';
import {Bookmark} from '../../models/bookmark';
import {ResultPlot} from '../../models/result';
import {ResultType} from '../../models/result';
import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListProps extends ActionHandler<ShelfAction|ResultAction> {
  plots: ResultPlot[];

  resultType?: ResultType;

  bookmark: Bookmark;

  limit?: number;
}

export class PlotListBase extends React.PureComponent<PlotListProps, any> {
  constructor(props: PlotListProps) {
    super(props);

    this.onLoadMore = this.onLoadMore.bind(this);
  }

  public render() {
    const {plots, handleAction, bookmark, limit} = this.props;
    const plotListItems = plots.slice(0, limit).map((plot, index) => {
      const {spec, fieldInfos} = plot;
      return (
        <Plot
          key={JSON.stringify(spec)}
          fieldInfos={fieldInfos}
          handleAction={handleAction}
          isPlotListItem={true}
          onSort={this.onPlotSort.bind(this, index)}
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
          <a styleName="load-more" onClick={this.onLoadMore}>
            Load more...
          </a>
        )}
      </div>
    );
  }

  private onPlotSort(index: number, channel: 'x' | 'y', value: SortOrder | SortField) {
    const {handleAction, resultType} = this.props;
    const action: ResultModifyFieldProp<'sort'> = {
      type: RESULT_MODIFY_FIELD_PROP,
      payload: {
        resultType,
        index,
        channel,
        prop: 'sort',
        value
      }
    };
    handleAction(action);
  }

  private onLoadMore() {
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
