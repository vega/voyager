/// <reference types="react" />
import * as React from 'react';
import { ActionHandler } from '../../actions/redux-action';
import { RelatedViewsAction } from '../../actions/related-views';
export interface RelatedViewsButtonProps extends ActionHandler<RelatedViewsAction> {
    collapseRelatedViews: boolean;
}
export declare class RelatedViewsButtonBase extends React.PureComponent<RelatedViewsButtonProps, {}> {
    constructor(props: RelatedViewsButtonProps);
    render(): JSX.Element;
    private onHideClick();
}
export declare const RelatedViewsButton: typeof RelatedViewsButtonBase;
