import {Schema} from 'compassql/build/src/schema';
import {SHELF_LOAD_QUERY} from '../../actions';
import {addCategoricalField} from '../../queries/field-suggestions';
import {summaries} from '../../queries/summaries';
import {shelfReducer} from './index';

describe('reducers/shelf', () => {
  const schema = new Schema({fields: []});
  describe(SHELF_LOAD_QUERY, () => {
    it('correctly loads a field suggestion query', () => {
      const query = addCategoricalField.createQuery({spec: {mark: '?', encodings: []}});
      expect(
        shelfReducer({
          spec: {
            filters: [],
            mark: 'point',
            encoding: {},
            anyEncodings: [],
            config: {}
          }
        }, {
          type: SHELF_LOAD_QUERY,
          payload: {query}
        }, schema),
      ).toEqual({
        spec: {
          filters: [],
          mark: '?',
          encoding: {},
          anyEncodings: [{
            channel: '?',
            field: '?',
            type: 'nominal'
          }],
          config: {}
        }
      });
    });

    it('correctly loads a related summaries query', () => {
      const query = summaries.createQuery({
        spec: {
          mark: '?',
          encodings: [{
            channel: 'x', field: 'displacement', type: 'quantitative'
          }]
        }
      });
      expect(
        shelfReducer({
          spec: {
            filters: [],
            mark: 'point',
            encoding: {},
            anyEncodings: [],
            config: {}
          }
        }, {
          type: SHELF_LOAD_QUERY,
          payload: {query}
        }, schema),
      ).toEqual({
        spec: {
          filters: [],
          mark: '?',
          encoding: {
            x: {fn: {enum: ['bin', 'mean']}, field: 'displacement', type: 'quantitative'}
          },
          anyEncodings: [],
          config: {}
        }
      });
    });
  });
});
