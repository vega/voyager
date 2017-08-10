import * as React from 'react';
import * as CSSModules from 'react-css-modules';

import {ActionHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {Bookmark} from '../../models/bookmark';
import {PlotObject} from '../../models/plot';
import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListProps extends ActionHandler<ShelfAction> {
  plots: PlotObject[];
  bookmark: Bookmark;

  limit?: number;
}

export class PlotListBase extends React.PureComponent<PlotListProps, any> {
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
      <div styleName="plot-list">
        {plotListItems}
      </div>
    );
  }
}

export const PlotList = CSSModules(PlotListBase, styles);
