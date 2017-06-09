/// <reference types="es6-promise" />
import 'isomorphic-fetch';
import { SpecQueryGroup } from 'compassql/build/src/model';
import { Query } from 'compassql/build/src/query/query';
import { Schema } from 'compassql/build/src/schema';
import { Data } from 'vega-lite/build/src/data';
import { PlotObject } from '../models/plot';
export { Query, Schema, Data };
export declare function fetchCompassQLRecommend(query: Query, schema: Schema, data: Data, config?: any): Promise<SpecQueryGroup<PlotObject>>;
export declare function fetchCompassQLBuildSchema(data: any, config?: any): Promise<Schema>;
