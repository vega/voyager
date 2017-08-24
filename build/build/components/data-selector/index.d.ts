/// <reference types="react" />
import * as React from 'react';
import { ActionHandler, DatasetAsyncAction } from '../../actions';
import { Dataset } from '../../models';
export interface DataSelectorOwnProps {
    title: 'Change' | 'Load';
}
export interface DataSelectorConnectProps {
    data: Dataset;
}
export declare type DataSelectorProps = DataSelectorConnectProps & DataSelectorOwnProps & ActionHandler<DatasetAsyncAction>;
export declare class DataSelectorBase extends React.PureComponent<DataSelectorProps, any> {
    constructor(props: DataSelectorProps);
    render(): JSX.Element;
    private renderDataset(dataset);
    private renderDatasetPanel();
    private renderUploadPanel();
    private renderPastePanel();
    private onDatasetChange(dataset);
    private onFileChange(event);
    private onDataTextSubmit();
    private openModal();
    private closeModal();
    private handleTextChange(event);
}
export declare const DataSelector: React.ComponentClass<DataSelectorOwnProps>;
