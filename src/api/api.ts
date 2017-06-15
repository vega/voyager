import 'isomorphic-fetch';

import {SpecQueryGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {recommend} from 'compassql/build/src/recommend';
import {build as buildSchema, Schema} from 'compassql/build/src/schema';
import {Data} from 'vega-lite/build/src/data';
import {convertToPlotObjectsGroup, PlotObject} from '../models/plot';

export {Query, Schema, Data};

export function fetchCompassQLRecommend(query: Query, schema: Schema, data: Data, config?: any):
  Promise<SpecQueryGroup<PlotObject>> {

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
    ).then(
      fields => {
        return new SpecQueryGroup<PlotObject>(fields.name, fields.path,
          fields.items, fields.groupBy, fields.orderGroupBy);
      }
    );
  } else {
    return new Promise(resolve => {
      const modelGroup = recommend(query, schema).result;

      resolve(convertToPlotObjectsGroup(modelGroup, data));
    });
  }
}

export function fetchCompassQLBuildSchema(data: any, config?: any):
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
