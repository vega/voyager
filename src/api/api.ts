/**
 * This file stores API for making request to CompassQL (either within the browser or via the server).
 */

import {Query} from 'compassql/build/src/query/query';
import {recommend} from 'compassql/build/src/recommend';
import {build as buildSchema, Schema} from 'compassql/build/src/schema';
import 'isomorphic-fetch';
import {Data} from 'vega-lite/build/src/data';
import {VoyagerConfig} from '../models/config';
import {convertToPlotList, PlotObject} from '../models/plot';

export {Query, Schema, Data};

/**
 * Submit recommendation query request from CompassQL
 */
export function fetchCompassQLRecommend(query: Query, schema: Schema, data: Data, config?: VoyagerConfig):
  Promise<PlotObject[]> {

  if (config && config.serverUrl) {
    const endpoint = "recommend";

    return fetch(`${config.serverUrl}/${endpoint}` , {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({
        query,
        // fieldSchemas are just JSON
        schema: schema.fieldSchemas,
        data
      })
    }).then(
      response => {
        return response.json();
      }
    );
  } else {
    return new Promise(resolve => {
      const modelGroup = recommend(query, schema).result;

      resolve(convertToPlotList(modelGroup, data));
    });
  }
}

/**
 * Submit schema building request from CompassQL
 */
export function fetchCompassQLBuildSchema(data: any, config?: VoyagerConfig):
  Promise<Schema> {

  if (config && config.serverUrl) {
    const endpoint = "build";

    return fetch(`${config.serverUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({
        data
      })
    }).then(
      response => {
        return response.json();
      }
    ).then(
      fields => {
        return new Schema({fields: fields.fields});
      }
    );

  } else {
    return new Promise(resolve => {
      resolve(buildSchema(data));
    });
  }

}
