import {Schema} from 'compassql/build/src/schema';
import {SHELF_LOAD_QUERY} from '../../actions';
import {SHELF_AUTO_ADD_COUNT_CHANGE, SHELF_GROUP_BY_CHANGE} from '../../actions/shelf/index';
import {DEFAULT_SHELF} from '../../models/shelf/index';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models/shelf/spec/index';
import {addCategoricalField} from '../../queries/field-suggestions';
import {summaries} from '../../queries/summaries';
import {shelfReducer} from './index';

describe('reducers/shelf', () => {
  const schema = new Schema({fields: []});

  describe(SHELF_AUTO_ADD_COUNT_CHANGE, () => {
    it('changes autoAddCount', () => {
      expect(
        shelfReducer({
          ...DEFAULT_SHELF
        }, {
          type: SHELF_AUTO_ADD_COUNT_CHANGE,
          payload: {autoAddCount: false}
        }, schema),
      ).toEqual({
        ...DEFAULT_SHELF,
        autoAddCount: false
      });
    });
  });

  describe(SHELF_GROUP_BY_CHANGE, () => {
    it('changes autoAddCount', () => {
      expect(
        shelfReducer({
          ...DEFAULT_SHELF
        }, {
          type: SHELF_GROUP_BY_CHANGE,
          payload: {groupBy: 'encoding'}
        }, schema),
      ).toEqual({
        ...DEFAULT_SHELF,
        groupBy: 'encoding'
      });
    });
  });

  describe(SHELF_LOAD_QUERY, () => {
    it('correctly loads a field suggestion query', () => {
      const query = addCategoricalField.createQuery({spec: {mark: '?', encodings: []}});
      expect(
        shelfReducer({
          ...DEFAULT_SHELF
        }, {
          type: SHELF_LOAD_QUERY,
          payload: {query}
        }, schema),
      ).toEqual({
        ...DEFAULT_SHELF,
        spec: {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [{
            channel: '?',
            field: '?',
            type: 'nominal',
            description: 'Categorical Fields'
          }]
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
          ...DEFAULT_SHELF,
          autoAddCount: false
        }, {
          type: SHELF_LOAD_QUERY,
          payload: {query}
        }, schema),
      ).toEqual({
        ...DEFAULT_SHELF,
        spec: {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: {enum: ['bin', 'mean']}, field: 'displacement', type: 'quantitative'}
          }
        }
      });
    });
  });
});
