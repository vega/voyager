import * as React from 'react';
import {ExtendedUnitSpec} from 'vega-lite/src/spec';
import * as vl from 'vega-lite';
import * as vega from 'vega';

export interface VegaLiteProps {
  spec: ExtendedUnitSpec

  renderer?: 'svg' | 'canvas';
}

export class VegaLite extends React.PureComponent<VegaLiteProps, any> {

  renderVega(vlSpec: ExtendedUnitSpec) {
    const {spec} = vl.compile(vlSpec);

    const runtime = vega.parse(spec);
    new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs['chart'] as any)
      .renderer(this.props.renderer || 'svg')
      .hover()
      .run();
  }

  componentDidMount() {
    this.renderVega(this.props.spec);
  }

  componentWillReceiveProps(nextProps: VegaLiteProps) {
    this.renderVega(nextProps.spec);
    // visual.update(nextProps.vegaSpec);
  }
  render() {
    return (
      <div>
        VL
        <div className='chart' ref='chart'/>
      </div>
    );
  }
}
