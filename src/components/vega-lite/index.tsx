import * as React from 'react';
import {ClipLoader} from 'react-spinners';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {TopLevelSpec} from 'vega-lite';
import {InlineData, isNamedData} from 'vega-lite/build/src/data';
import * as vegaTooltip from 'vega-tooltip';
import {SPINNER_COLOR} from '../../constants';
import {Logger} from '../util/util.logger';

export interface VegaLiteProps {
  spec: TopLevelSpec;

  renderer?: 'svg' | 'canvas';

  logger: Logger;

  data: InlineData;

  viewRunAfter?: (view: vega.View) => any;
}

export interface VegaLiteState {
  isLoading: boolean;
}

const CHART_REF = 'chart';

export class VegaLite extends React.PureComponent<VegaLiteProps, VegaLiteState> {
  private view: vega.View;
  private size: {width: number, height: number};

  private mountTimeout: number;
  private updateTimeout: number;

  constructor(props: VegaLiteProps) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  public render() {
    return (
      <div>
        <ClipLoader color={SPINNER_COLOR} loading={this.state.isLoading}/>
        <div className='chart' ref={CHART_REF}/>
        {/* chart is defined in app.scss */}
        <div id="vis-tooltip" className="vg-tooltip"/>
      </div>
    );
  }

  public componentDidMount() {
    if (this.mountTimeout) {
      clearTimeout(this.mountTimeout);
    }
    this.setState({
      isLoading: true
    });
    this.mountTimeout = window.setTimeout(() => {
      this.updateSpec();
      this.runView();
      this.setState({
        isLoading: false
      });
    });
  }

  public componentWillReceiveProps(nextProps: VegaLiteProps) {
    if (nextProps.spec !== this.props.spec) {
      this.setState({
        isLoading: true
      });
      this.size = this.getChartSize();
    }
  }

  public componentDidUpdate(prevProps: VegaLiteProps, prevState: VegaLiteState) {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.updateTimeout = window.setTimeout(
      (spec: TopLevelSpec, data: InlineData) => {
        if (prevProps.spec !== spec) {
          const chart = this.refs[CHART_REF] as HTMLElement;
          chart.style.width = this.size.width + 'px';
          chart.style.height = this.size.height + 'px';
          this.updateSpec();
        } else if (prevProps.data !== data) {
          this.bindData();
        }
        this.runView();
        this.setState({
          isLoading: false
        });
      },
      0, this.props.spec, this.props.data
    );
  }

  public componentWillUnmount() {
    if (this.mountTimeout) {
      clearTimeout(this.mountTimeout);
    }

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    if (this.view) {
      this.view.finalize();
    }
  }

  protected updateSpec() {
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
    const {logger} = this.props;
    const vlSpec = this.props.spec;
    try {
      const spec = vl.compile(vlSpec, {logger}).spec;
      const runtime = vega.parse(spec, vlSpec.config);
      this.view = new vega.View(runtime)
        .logLevel(vega.Warn)
        .initialize(this.refs[CHART_REF] as any)
        .renderer(this.props.renderer || 'canvas')
        .hover();
      vegaTooltip.vega(this.view);
      this.bindData();
    } catch (err) {
      logger.error(err);
    }
  }


  private bindData() {
    const {data, spec} = this.props;
    if (data && isNamedData(spec.data)) {
      this.view.change(spec.data.name,
        vega.changeset()
            .remove(() => true) // remove previous data
            .insert(data.values)
      );
    }
  }

  private runView() {
    try {
      this.view.run();
      if (this.props.viewRunAfter) {
        this.view.runAfter(this.props.viewRunAfter);
      }
    } catch (err) {
      this.props.logger.error(err);
    }
  }

  private getChartSize(): {width: number, height: number} {
    const chart = this.refs[CHART_REF] as HTMLElement;
    const chartContainer = chart.querySelector(this.props.renderer || 'canvas');
    const width = Number(chartContainer.getAttribute('width'));
    const height = Number(chartContainer.getAttribute('height'));
    return {width, height};
  }
}
