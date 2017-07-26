/// <reference types="react" />
import * as React from 'react';
import { ActionHandler, DatasetAsyncAction, ShelfFieldAutoAdd } from '../../actions';
import { DatasetSchemaChangeFieldType } from '../../actions/dataset';
import { Dataset } from '../../models';
import { VoyagerConfig } from '../../models/config';
export interface DataPanelProps extends ActionHandler<DatasetAsyncAction | ShelfFieldAutoAdd | DatasetSchemaChangeFieldType> {
    data: Dataset;
    config: VoyagerConfig;
}
export declare class DataPanelBase extends React.PureComponent<DataPanelProps, {}> {
    render(): JSX.Element;
}
export declare const DataPane: React.ComponentClass<{}>;
