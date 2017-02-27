import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {ExtendedUnitSpec} from 'vega-lite/src/spec';

export interface VegaLiteProps {
  spec: ExtendedUnitSpec;

  renderer?: 'svg' | 'canvas';
}

const CHART_REF = 'chart';

export class VegaLite extends React.PureComponent<VegaLiteProps, any> {

  public render() {
    return (
      <div>
        VL
        <div className='chart' ref={CHART_REF}/>
      </div>
    );
  }
  protected renderVega(vlSpec: ExtendedUnitSpec) {
    const {spec} = vl.compile(vlSpec);

    const runtime = vega.parse(spec);
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
    this.renderVega(nextProps.spec);
    // visual.update(nextProps.vegaSpec);
  }
}
