import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {TopLevelExtendedSpec} from 'vega-lite/build/src/spec';
import * as vegaTooltip from 'vega-tooltip';
import {LOG_ERROR_CHANGE, LOG_WARNINGS_ADD, LogAction} from '../../actions/log';
import {ActionHandler} from '../../actions/redux-action';
import {localLogger} from '../../store/index';

export interface VegaLiteProps extends ActionHandler<LogAction> {
  spec: TopLevelExtendedSpec;

  renderer?: 'svg' | 'canvas';
}

const CHART_REF = 'chart';

export class VegaLite extends React.PureComponent<VegaLiteProps, {}> {

  public render() {
    return (
      <div>
        <div className='chart' ref={CHART_REF}/>
        <div id="vis-tooltip" className="vg-tooltip"/>
      </div>
    );
  }
  protected renderVega(vlSpec: TopLevelExtendedSpec) {
    // NOTE: spec used to test warning logger
    // vlSpec = {
    //   "description": "A simple bar chart with embedded data.",
    //   "data": {
    //     "values": [
    //       {"a": "A", "b": 28},
    //       {"a": "B", "b": 55},
    //       {"a": "C", "b": 43},
    //       {"a": "D", "b": 91},
    //       {"a": "E", "b": 81},
    //       {"a": "F", "b": 53},
    //       {"a": "G", "b": 19},
    //       {"a": "H", "b": 87},
    //       {"a": "I", "b": 52}
    //     ]
    //   },
    //   "mark": "bar",
    //   "encoding": {
    //     "x": {"field": "a", "type": "quantitative"},
    //     "y": {"field": "b", "type": "quantitative"}
    //   }
    // };
    const {spec} = vl.compile(vlSpec, localLogger);

    if (localLogger.errors.length > 0) {
      this.addVLErrors(localLogger.errors[0]);
    }
    if (localLogger.warnings.length > 0) {
      this.addVLWarnings(localLogger.warnings);
    }
    localLogger.removeAll();
    const runtime = vega.parse(spec, vlSpec.config);
    const view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs[CHART_REF] as any)
      .renderer(this.props.renderer || 'svg')
      .hover()
      .run();
    vegaTooltip.vega(view);
  }

  protected componentDidMount() {
    this.renderVega(this.props.spec);
  }

  protected addVLWarnings(warnings: string[]) {
    const {handleAction} = this.props;
    handleAction({
      type: LOG_WARNINGS_ADD,
      payload: {
        warnings
      }
    });
  }

  protected addVLErrors(error: string) {
    const {handleAction} = this.props;
    handleAction({
      type: LOG_ERROR_CHANGE,
      payload: {
        error
      }
    });
  }

  protected componentWillReceiveProps(nextProps: VegaLiteProps) {
    if (this.props.spec !== nextProps.spec) {
      setTimeout(() => {
        this.renderVega(nextProps.spec);
      });
    }
    // visual.update(nextProps.vegaSpec);
  }
}

