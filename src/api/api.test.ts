declare var require: any;
// tslint:disable-next-line:no-var-requires
const fetchMock = require('fetch-mock');
import {fetchCompassQLBuildSchema, fetchCompassQLRecommend} from './api';

import {Channel} from 'vega-lite/build/src/channel';
import {Type} from 'vega-lite/build/src/type';

import {Query} from 'compassql/build/src/query/query';
import {Schema} from 'compassql/build/src/schema';


describe('api/api', () => {
  describe('fetchCompassQLRecommend', () => {
    const schema = new Schema({fields: []});
    const data = {values: [{a: 1}]};
    const q: Query = {
      spec: {
        mark: '?',
        encodings: [
          {channel: Channel.X, field: '*', type: Type.QUANTITATIVE}
        ]
      },
      nest: [
        {groupBy: 'fieldTransform'}
      ],
      orderBy: 'effectiveness',
    };
    it('should return results for local recommend', () => {
      expect.assertions(1);
      return fetchCompassQLRecommend(q, schema, data).then(
        result => {
          return expect(result.length).toEqual(1);
        }
      );
    });
    it('should return results for remote recommend', () => {
      fetchMock.postOnce('*', ['1']);
      expect.assertions(1);

      return fetchCompassQLRecommend(q, schema, data, {serverUrl: 'http://localhost'}).then(
        result => {
          return expect(result.length).toEqual(1);
        }
      );
    });
  });

  describe('fetchCompassQLBuildSchema', () => {
    const data: any[] = [];
    it('should return results for local recommend', () => {
      expect.assertions(1);
      return fetchCompassQLBuildSchema(data).then(
        result => {
          return expect(result.fieldNames().length).toEqual(0);
        }
      );
    });
    it('should return results for remote recommend', () => {
      fetchMock.postOnce('*', {fields: []});
      expect.assertions(1);

      return fetchCompassQLBuildSchema(data, {serverUrl: 'http://localhost'}).then(
        result => {
          return expect(result.fieldNames().length).toEqual(0);
        }
      );
    });
  });
});
