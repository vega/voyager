/// <reference types="react" />
import * as React from 'react';
import { InlineData } from 'vega-lite/build/src/data';
import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { VoyagerConfig } from '../../models/config';
import { Result } from '../../models/result/index';
import { ShelfFilter } from '../../models/shelf/filter';
import { ShelfGroupBy } from '../../models/shelf/index';
export interface ViewPaneProps extends ActionHandler<ShelfAction> {
    isQuerySpecific: boolean;
    spec: FacetedCompositeUnitSpec;
    result: Result;
    bookmark: Bookmark;
    autoAddCount: boolean;
    groupBy: ShelfGroupBy;
    defaultGroupBy: ShelfGroupBy;
    config: VoyagerConfig;
    data: InlineData;
    filters: ShelfFilter[];
}
export declare const ViewPane: React.ComponentClass<{}>;
