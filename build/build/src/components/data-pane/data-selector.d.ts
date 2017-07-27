/// <reference types="react" />
import * as React from 'react';
import { ActionHandler, DatasetAsyncAction } from '../../actions';
import { Dataset } from '../../models';
export interface DataSelectorProps extends ActionHandler<DatasetAsyncAction> {
    data: Dataset;
    name: string;
}
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
export declare const DataSelector: React.ComponentClass<{}>;
