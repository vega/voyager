import * as fetch from 'isomorphic-fetch';

import {SpecQueryGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {recommend} from 'compassql/build/src/recommend';
import {Schema} from 'compassql/build/src/schema';
import {Data} from 'vega-lite/build/src/data';
import {convertToPlotObjectsGroup, PlotObject} from '../models/plot';

export function fetchCompassQLResult(query: Query, schema: Schema, data: Data, config?: any) {

  if (config && config.serverUrl) {

    return fetch(config.serverUrl, {
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
