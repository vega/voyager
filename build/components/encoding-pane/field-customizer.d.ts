/// <reference types="react" />
import * as React from 'react';
import { ActionHandler } from '../../actions/redux-action';
import { SpecEncodingAction } from '../../actions/shelf/spec';
import { ShelfFieldDef, ShelfId } from '../../models/shelf/spec/encoding';
export interface FieldCustomizerProps extends ActionHandler<SpecEncodingAction> {
    shelfId: ShelfId;
    fieldDef: ShelfFieldDef;
}
export declare class FieldCustomizerBase extends React.PureComponent<FieldCustomizerProps, {}> {
    render(): JSX.Element;
    private customizableProps();
}
export declare const FieldCustomizer: typeof FieldCustomizerBase;
