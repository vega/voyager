/// <reference types="react" />
import * as React from 'react';
import { CustomWildcardAction } from '../../actions/custom-wildcard-field';
import { ActionHandler } from '../../actions/redux-action';
import { CustomWildcardFieldDef } from '../../models/custom-wildcard-field';
export interface CustomWildcardFieldEditorProps extends ActionHandler<CustomWildcardAction> {
    customWildcardFielddef: CustomWildcardFieldDef;
    index: number;
}
export declare class CustomWildcardFieldEditorBase extends React.PureComponent<CustomWildcardFieldEditorProps, {}> {
    constructor(props: CustomWildcardFieldEditorProps);
    render(): JSX.Element;
    protected onRemoveField(field: string): void;
    protected onRemoveWildcard(): void;
    private onDescriptionChange(event);
}
export declare const CustomWildcardFieldEditor: typeof CustomWildcardFieldEditorBase;
