/// <reference types="react" />
import * as React from 'react';
import { TopLevelExtendedSpec } from 'vega-lite/build/src/spec';
export interface VegaLiteProps {
    spec: TopLevelExtendedSpec;
    renderer?: 'svg' | 'canvas';
}
export declare class VegaLite extends React.PureComponent<VegaLiteProps, any> {
    render(): JSX.Element;
    protected renderVega(vlSpec: TopLevelExtendedSpec): void;
    protected componentDidMount(): void;
    protected componentWillReceiveProps(nextProps: VegaLiteProps): void;
}
