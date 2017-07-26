/// <reference types="react" />
import * as React from 'react';
import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { PlotObject } from '../../models/plot';
export interface ViewPaneProps extends ActionHandler<ShelfAction> {
    isQuerySpecific: boolean;
    spec: FacetedCompositeUnitSpec;
    plots: PlotObject[];
    bookmark: Bookmark;
}
export declare const ViewPane: React.ComponentClass<{}>;
