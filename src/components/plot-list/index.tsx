import * as React from 'react';
import * as CSSModules from 'react-css-modules';

import {PlotObject} from '../../models/plot';
import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListProps {
  plots: PlotObject[];
}

class PlotListBase extends React.PureComponent<PlotListProps, any> {
  public render() {
    const {plots} = this.props;
    const plotListItems = plots.map(plot => {
      const {spec, fieldInfos} = plot;
      return (
        <div styleName="plot-list-item" key={JSON.stringify(spec)}>
          <Plot spec={spec} fieldInfos={fieldInfos} fit={true} scrollOnHover={true}/>
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
