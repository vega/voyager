/// <reference types="react" />
import * as React from 'react';
import { VoyagerConfig } from '../../models/config';
export interface DataPanelProps {
    config: VoyagerConfig;
}
export declare class LoadDataBase extends React.PureComponent<DataPanelProps, {}> {
    render(): JSX.Element;
}
export declare const LoadData: React.ComponentClass<{}>;
