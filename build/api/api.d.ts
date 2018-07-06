/**
 * This file stores API for making request to CompassQL (either within the browser or via the server).
 */
import { Query } from 'compassql/build/src/query/query';
import { Schema } from 'compassql/build/src/schema';
import 'isomorphic-fetch';
import { Data, InlineData } from 'vega-lite/build/src/data';
import { VoyagerConfig } from '../models/config';
import { ResultPlotWithKey } from '../models/result';
export { Query, Schema, Data };
/**
 * Submit recommendation query request from CompassQL
 */
export declare function fetchCompassQLRecommend(query: Query, schema: Schema, data: InlineData, config?: VoyagerConfig): Promise<ResultPlotWithKey[]>;
/**
 * Submit schema building request from CompassQL
 */
export declare function fetchCompassQLBuildSchema(data: Object[], config?: VoyagerConfig): Promise<Schema>;
