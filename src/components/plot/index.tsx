import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ExtendedSpec} from 'vega-lite/build/src/spec';

import * as styles from './plot.scss';

import {VegaLite} from '../vega-lite/index';

export interface PlotProps {
  spec: ExtendedSpec;
}

class PlotBase extends React.PureComponent<PlotProps, any> {
  public render() {
    const {spec} = this.props;

    return (
      <div styleName="plot">
        <VegaLite spec={spec}/>
      </div>
    );
  }
}

export const Plot = CSSModules(PlotBase, styles);
