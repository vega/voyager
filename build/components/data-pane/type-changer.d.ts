/// <reference types="react" />
import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import { DatasetSchemaChangeFieldType } from '../../actions/dataset';
import { ActionHandler } from '../../actions/redux-action';
export interface TypeChangerProps extends ActionHandler<DatasetSchemaChangeFieldType> {
    field: string;
    type: ExpandedType;
    validTypes: ExpandedType[];
}
export declare class TypeChangerBase extends React.PureComponent<TypeChangerProps, {}> {
    render(): JSX.Element;
    protected onTypeChange(e: any): void;
}
export declare const TypeChanger: typeof TypeChangerBase;
