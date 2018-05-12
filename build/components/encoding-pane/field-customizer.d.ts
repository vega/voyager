/// <reference types="react" />
import * as React from 'react';
import { ActionHandler } from '../../actions';
import { SpecEncodingAction } from '../../actions/shelf';
import { ShelfFieldDef, ShelfId } from '../../models/shelf/spec';
export interface FieldCustomizerProps extends ActionHandler<SpecEncodingAction> {
    shelfId: ShelfId;
    fieldDef: ShelfFieldDef;
}
export interface CustomProp {
    prop: string;
    nestedProp?: string;
}
export declare class FieldCustomizerBase extends React.PureComponent<FieldCustomizerProps, {}> {
    render(): JSX.Element;
}
export declare const FieldCustomizer: typeof FieldCustomizerBase;
