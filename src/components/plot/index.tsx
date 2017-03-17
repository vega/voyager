import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {FacetedUnitSpec} from 'vega-lite/build/src/spec';

import * as styles from './plot.scss';

import {ActionHandler} from '../../actions/redux-action';
import {SHELF_SPEC_LOAD, ShelfSpecLoad} from '../../actions/shelf';
import {PLOT_HOVER_MIN_DURATION} from '../../constants';
import {PlotFieldInfo} from '../../models/plot';
import {Field} from '../field/index';
import {VegaLite} from '../vega-lite/index';

export interface PlotProps extends ActionHandler<ShelfSpecLoad> {
  fieldInfos?: PlotFieldInfo[];
  isPlotListItem?: boolean;
  scrollOnHover?: boolean;
  showSpecifyButton?: boolean;
  spec: FacetedUnitSpec;
}

export interface PlotState {
  hovered: boolean;
}

class PlotBase extends React.PureComponent<PlotProps, any> {

  private hoverTimeoutId: number;

  constructor(props: PlotProps) {
    super(props);
    this.state = {hovered: false};

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onSpecify = this.onSpecify.bind(this);
  }
  public render() {
    const {isPlotListItem, scrollOnHover, showSpecifyButton, spec} = this.props;

    return (
      <div
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        styleName={isPlotListItem ? 'plot-list-item-group' : 'plot-group'}
      >
        <div styleName="plot-info">
          <div styleName="plot-command">
            {showSpecifyButton && this.specifyButton()}
          </div>
          {this.fields()}
        </div>
        <div
          styleName={scrollOnHover && this.state.hovered ? 'plot-scroll' : 'plot'}
          className="persist-scroll"
        >
          <VegaLite spec={spec}/>
        </div>
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

  private onSpecify() {
    const {handleAction, spec} = this.props;
    handleAction({
      type: SHELF_SPEC_LOAD,
      payload: {spec}
    });
  }

  private specifyButton() {
    return <i
      className="fa fa-server"
      styleName="specify-button"
      onClick={this.onSpecify}
    />;
  }
}

export const Plot = CSSModules(PlotBase, styles);
