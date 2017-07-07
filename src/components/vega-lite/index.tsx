import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {TopLevelExtendedSpec} from 'vega-lite/build/src/spec';
import * as vegaTooltip from 'vega-tooltip';
import {Logger} from '../../models/shelf/logger';
import {Warnings} from './warnings';

export interface VegaLiteProps {
  spec: TopLevelExtendedSpec;

  renderer?: 'svg' | 'canvas';

  logger: Logger;
}

export interface VegaLiteState {
  warnings: any[];
}

const CHART_REF = 'chart';

export class VegaLite extends React.PureComponent<VegaLiteProps, VegaLiteState> {
  constructor(props: VegaLiteProps) {
    super(props);
    this.state = {
      warnings: []
    };
  }

  public render() {
    return (
      <div>
        <div className='chart' ref={CHART_REF}/>
        <div id="vis-tooltip" className="vg-tooltip"/>
        <Warnings warnings={this.props.logger.warns}/>
      </div>
    );
  }

  protected renderVega(vlSpec: TopLevelExtendedSpec) {
    const {logger} = this.props;
    const {spec} = vl.compile(vlSpec, logger);

    const runtime = vega.parse(spec, vlSpec.config);
    const view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs[CHART_REF] as any)
      .renderer(this.props.renderer || 'svg')
      .hover()
      .run();
    vegaTooltip.vega(view);

    this.setState({
      warnings: logger.warns
    });
  }

  protected componentDidMount() {
    this.renderVega(this.props.spec);
  }

  protected componentWillReceiveProps(nextProps: VegaLiteProps) {
    if (this.props.spec !== nextProps.spec) {
      this.renderVega(nextProps.spec);
    }
    // visual.update(nextProps.vegaSpec);
  }
}
