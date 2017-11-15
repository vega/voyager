/// <reference types="react" />
import * as React from 'react';
import { ActionHandler } from '../../actions/redux-action';
import { SpecEncodingAction } from '../../actions/shelf/spec';
import { ShelfFieldDef, ShelfId } from '../../models/shelf/spec/encoding';
export interface PropertyEditorProps extends ActionHandler<SpecEncodingAction> {
    prop: string;
    nestedProp: string;
    shelfId: ShelfId;
    fieldDef: ShelfFieldDef;
}
export declare class PropertyEditorBase extends React.PureComponent<PropertyEditorProps, {}> {
    constructor(props: PropertyEditorProps);
    render(): JSX.Element;
    protected changeFieldProperty(result: any): void;
}
export declare const PropertyEditor: typeof PropertyEditorBase;
