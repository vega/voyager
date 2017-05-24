import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {TopLevelExtendedSpec} from 'vega-lite/build/src/spec';

export interface VegaLiteProps {
  spec: TopLevelExtendedSpec;

  renderer?: 'svg' | 'canvas';
}

const CHART_REF = 'chart';

export class VegaLite extends React.PureComponent<VegaLiteProps, any> {

  public render() {
    return (
      <div className='chart' ref={CHART_REF}/>
    );
  }
  protected renderVega(vlSpec: TopLevelExtendedSpec) {
    const {spec} = vl.compile(vlSpec);

    const runtime = vega.parse(spec, vlSpec.config);
    new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs[CHART_REF] as any)
      .renderer(this.props.renderer || 'svg')
      .hover()
      .run();
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
