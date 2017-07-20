import * as React from 'react';
import * as CSSModules from 'react-css-modules';

import {ActionHandler} from '../../actions/redux-action';
import {ShelfAction} from '../../actions/shelf';
import {PlotObject} from '../../models/plot';
import {Logger} from '../../models/shelf/logger';
import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListProps extends ActionHandler<ShelfAction> {
  plots: PlotObject[];
  logger: Logger;
}

class PlotListBase extends React.PureComponent<PlotListProps, {}> {
  public render() {
    const {plots, handleAction, logger} = this.props;
    const plotListItems = plots.map(plot => {
      const {spec, fieldInfos} = plot;
      return (
        <Plot
          key={JSON.stringify(spec)}
          fieldInfos={fieldInfos}
          handleAction={handleAction}
          isPlotListItem={true}
          scrollOnHover={true}
          showSpecifyButton={true}
          spec={spec}
          logger={logger}
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
