import {combineReducers} from 'redux';
import {RESET} from '../actions';
import {DEFAULT_PERSISTENT_STATE, PersistentState} from '../models/index';
import {makeResetReducer, ResetIndex} from './reset';

describe(RESET, () => {

  const persistentStateToReset: ResetIndex<PersistentState> = {
    bookmark: true,
    config: false,
    log: false,
    shelfPreview: true
  };

  const getResetReducer = (defaultState = DEFAULT_PERSISTENT_STATE) => {
    return makeResetReducer(
      combineReducers<PersistentState>({
        bookmark: (state: any = defaultState.bookmark) => state,
        config: (state: any = defaultState.config) => state,
        log: (state: any = defaultState.log) => state,
        shelfPreview: (state: any = defaultState.shelfPreview) => state
      }),
      persistentStateToReset,
      defaultState
    );
  };

  it('Should reset to right default value', () => {
    const resetReducer = getResetReducer();
    expect(
      resetReducer(DEFAULT_PERSISTENT_STATE, {type: RESET})
    ).toEqual(DEFAULT_PERSISTENT_STATE);
  });

  it('Should reset bookmark when resetIndex is true', () => {
    const resetReducer = getResetReducer();
    expect(
      resetReducer(DEFAULT_PERSISTENT_STATE, {type: RESET})
    ).toEqual(DEFAULT_PERSISTENT_STATE);
    const newModifiedState = {
      ...DEFAULT_PERSISTENT_STATE,
      bookmark: {
        ...DEFAULT_PERSISTENT_STATE.bookmark,
        count: 100
      }
    };
    expect(
      resetReducer(newModifiedState, {type: 'NEWACTION'})
    ).toEqual(newModifiedState);

    expect(
      resetReducer(newModifiedState, {type: RESET})
    ).toEqual(DEFAULT_PERSISTENT_STATE);
  });

  it('Should not reset config when resetIndex is false', () => {
    const modifiedDefaultState = {
      ...DEFAULT_PERSISTENT_STATE,
      vegaliteConfig: {
        mark: {
          color: 'black'
        }
      }
    };
    const resetReducer = getResetReducer(modifiedDefaultState);
    expect(
      resetReducer(modifiedDefaultState, {type: RESET})
    ).toEqual(modifiedDefaultState);
    const newModifiedState = {
      ...modifiedDefaultState,
      config: {
        vegaliteConfig: {
          mark: {
            color: 'white'
          }
        }
      }
    };
    expect(
      resetReducer(newModifiedState, {type: RESET})
    ).toEqual(newModifiedState);
  });
});
