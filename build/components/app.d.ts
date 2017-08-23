/// <reference types="react" />
import * as React from 'react';
import { Dispatch } from 'redux';
import { Data } from 'vega-lite/build/src/data';
import { FacetedCompositeUnitSpec, TopLevel } from 'vega-lite/build/src/spec';
import { VoyagerConfig } from '../models/config';
import { State } from '../models/index';
export interface Props extends React.Props<App> {
    config?: VoyagerConfig;
    data?: Data;
    applicationState?: Readonly<State>;
    spec?: TopLevel<FacetedCompositeUnitSpec>;
    filename?: string;
    dispatch: Dispatch<State>;
}
export declare class App extends React.PureComponent<Props, {}> {
    constructor(props: any);
    componentWillUpdate(nextProps: Props): void;
    componentWillMount(): void;
    render(): JSX.Element;
    private update(nextProps);
    private setData(data, filename);
    private setConfig(config);
    private setSpec(spec, filename);
    private shelfSpecLoad(spec);
    private setApplicationState(state);
}
