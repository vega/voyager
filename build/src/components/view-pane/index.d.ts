/// <reference types="react" />
import { SpecQueryGroup } from 'compassql/build/src/model';
import { Query } from 'compassql/build/src/query/query';
import * as React from 'react';
import { Data } from 'vega-lite/build/src/data';
import { OneOfFilter, RangeFilter } from 'vega-lite/build/src/filter';
import { ActionHandler } from '../../actions/redux-action';
import { ShelfAction } from '../../actions/shelf';
import { Bookmark } from '../../models/bookmark';
import { PlotObject } from '../../models/plot';
export interface ViewPaneProps extends ActionHandler<ShelfAction> {
    data: Data;
    query: Query;
    filters: Array<RangeFilter | OneOfFilter>;
    mainResult: SpecQueryGroup<PlotObject>;
    bookmark: Bookmark;
}
export declare const ViewPane: React.ComponentClass<{}>;
