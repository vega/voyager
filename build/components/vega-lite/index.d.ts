/// <reference types="react" />
import * as React from 'react';
import * as vega from 'vega';
import { InlineData } from 'vega-lite/build/src/data';
import { TopLevelExtendedSpec } from 'vega-lite/build/src/spec';
import { Logger } from '../util/util.logger';
export interface VegaLiteProps {
    spec: TopLevelExtendedSpec;
    renderer?: 'svg' | 'canvas';
    logger: Logger;
    data: InlineData;
    viewRunAfter?: (view: vega.View) => any;
}
export interface VegaLiteState {
    isLoading: boolean;
}
export declare class VegaLite extends React.PureComponent<VegaLiteProps, VegaLiteState> {
    private view;
    private size;
    private mountTimeout;
    private updateTimeout;
    constructor(props: VegaLiteProps);
    render(): JSX.Element;
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: VegaLiteProps): void;
    componentDidUpdate(prevProps: VegaLiteProps, prevState: VegaLiteState): void;
    componentWillUnmount(): void;
    protected updateSpec(): void;
    private bindData();
    private runView();
    private getChartSize();
}
