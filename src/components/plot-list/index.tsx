import * as React from 'react';
import * as CSSModules from 'react-css-modules';

import {ActionHandler} from '../../actions/redux-action';
import {ShelfSpecLoad} from '../../actions/shelf';
import {PlotObject} from '../../models/plot';
import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListProps extends ActionHandler<ShelfSpecLoad> {
  plots: PlotObject[];
}

class PlotListBase extends React.PureComponent<PlotListProps, any> {
  public render() {
    const {plots, handleAction} = this.props;
    const plotListItems = plots.map(plot => {
      const {spec, fieldInfos} = plot;
      return (
        <div styleName="plot-list-item" key={JSON.stringify(spec)}>
          <Plot
            fieldInfos={fieldInfos}
            fit={true}
            handleAction={handleAction}
            scrollOnHover={true}
            showSpecifyButton={true}
            spec={spec}
          />
        </div>
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
