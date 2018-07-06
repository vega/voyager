/// <reference types="react" />
import * as React from 'react';
import { Dataset } from '../../models';
import { VoyagerConfig } from '../../models/config';
export interface DataPanelProps {
    data: Dataset;
    config: VoyagerConfig;
}
export declare class DataPaneBase extends React.PureComponent<DataPanelProps, {}> {
    render(): JSX.Element;
}
export declare const DataPane: React.ComponentClass<{}>;
