import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ExtendedSpec} from 'vega-lite/build/src/spec';

import * as styles from './plot.scss';

import {PLOT_HOVER_MIN_DURATION} from '../../constants';
import {PlotFieldInfo} from '../../models/plot';
import {Field} from '../field/index';
import {VegaLite} from '../vega-lite/index';

export interface PlotProps {
  fieldInfos?: PlotFieldInfo[];

  fit?: boolean;
  scrollOnHover?: boolean;
  spec: ExtendedSpec;
}

export interface PlotState {
  hovered: boolean;
}

class PlotBase extends React.PureComponent<PlotProps, any> {

  private hoverTimeoutId: number;

  constructor(props: PlotProps) {
    super(props);
    this.state = {hovered: false};

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }
  public render() {
    const {fit, scrollOnHover, spec} = this.props;

    return (
      <div
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        styleName={scrollOnHover && this.state.hovered ? 'plot-scroll' : 'plot'}
        className={`persist-scroll ${fit ? 'fit' : ''}`}
      >
        <div styleName="plot-info">
          {this.fields()}
        </div>
        <VegaLite spec={spec}/>
      </div>
    );
  }

  protected componentWillUnmount() {
    this.clearHoverTimeout();
  }

  private fields() {
    const {fieldInfos} = this.props;
    if (fieldInfos) {
      return fieldInfos.map(fieldInfo => {
        const {fieldDef, isEnumeratedWildcardField} = fieldInfo;
        return (
          <div styleName="plot-field-info" key={JSON.stringify(fieldDef)}>
            <Field
              fieldDef={fieldDef}
              draggable={false}
              isEnumeratedWildcardField={isEnumeratedWildcardField}
              isPill={false}
            />
          </div>
        );
      });
    }
    return undefined;
  }

  private clearHoverTimeout() {
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = undefined;
    }
  }

  private onMouseEnter() {
    this.hoverTimeoutId = setTimeout(
      () => {
        // TODO log action
        this.setState({hovered: true});
      },
      PLOT_HOVER_MIN_DURATION
    );
  }

  private onMouseLeave() {
    this.clearHoverTimeout();
    if (this.state.hovered) {
      this.setState({hovered: false});
    }
  }
}

export const Plot = CSSModules(PlotBase, styles);
