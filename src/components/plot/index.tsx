import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';

import * as styles from './plot.scss';

import {ActionHandler} from '../../actions/redux-action';
import {SHELF_SPEC_LOAD, SHELF_SPEC_PREVIEW, SHELF_SPEC_PREVIEW_DISABLE, ShelfAction} from '../../actions/shelf';
import {PLOT_HOVER_MIN_DURATION} from '../../constants';
import {PlotFieldInfo} from '../../models/plot';
import {Field} from '../field/index';
import {VegaLite} from '../vega-lite/index';

export interface PlotProps extends ActionHandler<ShelfAction> {
  fieldInfos?: PlotFieldInfo[];
  isPlotListItem?: boolean;
  scrollOnHover?: boolean;
  showSpecifyButton?: boolean;
  spec: FacetedCompositeUnitSpec;
}

export interface PlotState {
  hovered: boolean;
  preview: boolean;
}

class PlotBase extends React.PureComponent<PlotProps, any> {

  private hoverTimeoutId: number;
  private previewTimeoutId: number;

  constructor(props: PlotProps) {
    super(props);
    this.state = {hovered: false, preview: false};

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onPreviewMouseEnter = this.onPreviewMouseEnter.bind(this);
    this.onPreviewMouseLeave = this.onPreviewMouseLeave.bind(this);
    this.onSpecify = this.onSpecify.bind(this);
  }
  public render() {
    const {isPlotListItem, scrollOnHover, showSpecifyButton, spec} = this.props;

    return (
      <div styleName={isPlotListItem ? 'plot-list-item-group' : 'plot-group'}>
        <div styleName="plot-info">
          <div styleName="plot-command">
            {showSpecifyButton && this.specifyButton()}
          </div>
          <span
            onMouseEnter={this.onPreviewMouseEnter}
            onMouseLeave={this.onPreviewMouseLeave}
          >
            {this.fields()}
          </span>
        </div>
        <div
          styleName={scrollOnHover && this.state.hovered ? 'plot-scroll' : 'plot'}
          className="persist-scroll"
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
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

  private clearPreviewTimeout() {
    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = undefined;
    }
  }

  private onMouseEnter() {
    this.hoverTimeoutId = setTimeout(
      () => {
        // TODO log action
        this.setState({hovered: true});
        this.hoverTimeoutId = undefined;
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

  private onPreviewMouseEnter() {
    this.previewTimeoutId = setTimeout(
      () => {
        const {handleAction, spec} = this.props;
        this.setState({preview: true});
        handleAction({
          type: SHELF_SPEC_PREVIEW,
          payload: {spec}
        });
        this.previewTimeoutId = undefined;
      },
      PLOT_HOVER_MIN_DURATION
    );
  }

  private onPreviewMouseLeave() {
    this.clearPreviewTimeout();
    if (this.state.preview) {
      this.setState({preview: false});
      const {handleAction} = this.props;
      handleAction({type: SHELF_SPEC_PREVIEW_DISABLE});
    }
  }

  private specifyButton() {
    return <i
      className="fa fa-server"
      styleName="specify-button"
      onClick={this.onSpecify}
      onMouseEnter={this.onPreviewMouseEnter}
      onMouseLeave={this.onPreviewMouseLeave}
    />;
  }
}

export const Plot = CSSModules(PlotBase, styles);
