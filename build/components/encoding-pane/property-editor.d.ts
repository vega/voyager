/// <reference types="react" />
import * as React from 'react';
import { ActionHandler } from '../../actions';
import { SpecEncodingAction } from '../../actions/shelf';
import { ShelfFieldDef, ShelfId } from '../../models/shelf/spec';
export interface PropertyEditorProps extends ActionHandler<SpecEncodingAction> {
    prop: string;
    nestedProp: string;
    propTab: string;
    shelfId: ShelfId;
    fieldDef: ShelfFieldDef;
}
export declare class PropertyEditorBase extends React.PureComponent<PropertyEditorProps, {}> {
    constructor(props: PropertyEditorProps);
    render(): JSX.Element;
    protected changeFieldProperty(result: any): void;
    private parseFormDataResult(result);
}
export declare const PropertyEditor: typeof PropertyEditorBase;
