import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ExtendedSpec} from 'vega-lite/build/src/spec';

import {Plot} from '../plot';
import * as styles from './plot-list.scss';

export interface PlotListProps {
  specs: ExtendedSpec[];
}

class PlotListBase extends React.PureComponent<PlotListProps, any> {
  public render() {
    const {specs} = this.props;
    const plots = specs.map(spec => (
      <div styleName="plot-list-item" key={JSON.stringify(spec)}>
        <Plot spec={spec} fit={true} scrollOnHover={true}/>
      </div>
    ));

    return (
      <div styleName="plot-list">
        {plots}
      </div>
    );
  }
}

export const PlotList = CSSModules(PlotListBase, styles);
