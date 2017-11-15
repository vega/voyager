/// <reference types="react" />
import * as React from 'react';
import { InlineData } from 'vega-lite/build/src/data';
import { TopLevelExtendedSpec } from 'vega-lite/build/src/spec';
import { Logger } from '../util/util.logger';
export interface VegaLiteProps {
    spec: TopLevelExtendedSpec;
    renderer?: 'svg' | 'canvas';
    logger: Logger;
    data: InlineData;
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
    protected updateSpec(): void;
    protected componentDidMount(): void;
    protected componentWillReceiveProps(nextProps: VegaLiteProps): void;
    protected componentDidUpdate(prevProps: VegaLiteProps, prevState: VegaLiteState): void;
    protected componentWillUnmount(): void;
    private bindData();
    private runView();
    private getChartSize();
}
