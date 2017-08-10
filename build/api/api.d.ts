/**
 * This file stores API for making request to CompassQL (either within the browser or via the server).
 */
import 'isomorphic-fetch';
import { SpecQueryGroup } from 'compassql/build/src/model';
import { Query } from 'compassql/build/src/query/query';
import { Schema } from 'compassql/build/src/schema';
import { Data } from 'vega-lite/build/src/data';
import { PlotObject } from '../models/plot';
export { Query, Schema, Data };
/**
 * Submit recommendation query request from CompassQL
 */
export declare function fetchCompassQLRecommend(query: Query, schema: Schema, data: Data, config?: any): Promise<SpecQueryGroup<PlotObject>>;
/**
 * Submit schema building request from CompassQL
 */
export declare function fetchCompassQLBuildSchema(data: any, config?: any): Promise<Schema>;
