/// <reference types="react" />
import * as React from 'react';
import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { ResultPlot } from '../../models/result';
import { ShelfGroupBy } from '../../models/shelf/index';
export interface ViewPaneProps extends ActionHandler<ShelfAction> {
    isQuerySpecific: boolean;
    spec: FacetedCompositeUnitSpec;
    plots: ResultPlot[];
    bookmark: Bookmark;
    mainLimit: number;
    autoAddCount: boolean;
    groupBy: ShelfGroupBy;
    defaultGroupBy: ShelfGroupBy;
}
export declare const ViewPane: React.ComponentClass<{}>;
