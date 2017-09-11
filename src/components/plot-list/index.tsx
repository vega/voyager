import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {ClipLoader} from 'react-spinners';
import {InlineData} from 'vega-lite/build/src/data';
import {SortField, SortOrder} from 'vega-lite/build/src/sort';
import {ActionHandler} from '../../actions/redux-action';
import {
  RESULT_LIMIT_INCREASE, RESULT_MODIFY_FIELD_PROP,
  ResultAction, ResultModifyFieldProp
} from '../../actions/result';
import {ShelfAction} from '../../actions/shelf';
import {SPINNER_COLOR} from '../../constants';
import {Bookmark} from '../../models/bookmark';
import {State} from '../../models/index';
import {ResultType} from '../../models/result';
import {Result} from '../../models/result/index';
import {selectFilteredData} from '../../selectors/index';
import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListOwnProps extends ActionHandler<ShelfAction|ResultAction> {
  result: Result;

  resultType?: ResultType;

  bookmark: Bookmark;
}

export interface PlotListConnectProps {
  data: InlineData;
}

export type PlotListProps = PlotListOwnProps & PlotListConnectProps;

export class PlotListBase extends React.PureComponent<PlotListProps, any> {
  constructor(props: PlotListProps) {
    super(props);

    this.onLoadMore = this.onLoadMore.bind(this);
  }

  public render() {
    const {handleAction, bookmark, data, result} = this.props;
    const {plots, limit, isLoading} = result;
    const plotListItems = plots && plots.slice(0, limit).map((plot, index) => {
      const {spec, fieldInfos} = plot;
      return (
        <Plot
          data={data}
          key={index}
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
          {isLoading ?
            <div styleName='plot-list-loading'>
              <ClipLoader color={SPINNER_COLOR}/>
            </div> :
          plotListItems}
        </div>
        {plots && plots.length > limit && (
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

export const PlotList = connect<PlotListConnectProps, {}, PlotListOwnProps>(
  (state: State /*, props*/) => {
    // TODO: once we have multiple cached data from Leilani's engine
    // take spec from props and read spec.data.name
    return {
      data: selectFilteredData(state)
    };
  }
)(CSSModules(PlotListBase, styles));
