/// <reference types="react" />
import * as React from 'react';
import { TopLevelExtendedSpec } from 'vega-lite/build/src/spec';
import { Logger } from '../util/util.logger';
export interface VegaLiteProps {
    spec: TopLevelExtendedSpec;
    renderer?: 'svg' | 'canvas';
    logger: Logger;
}
export declare class VegaLite extends React.PureComponent<VegaLiteProps, any> {
    render(): JSX.Element;
    protected renderVega(vlSpec: TopLevelExtendedSpec): void;
    protected componentDidMount(): void;
    protected componentWillReceiveProps(nextProps: VegaLiteProps): void;
}
