import {combineReducers} from 'redux';
import {RESET} from '../actions';
import {makeResetReducer, ResetIndex} from './reset';

describe(RESET, () => {

  interface DummyState {
    persistentState: object;
    nonPersistentState: object;
  }

  const DEFAULT_DUMMY_STATE = {
    persistentState: {},
    nonPersistentState: {}
  };

  const persistentStateToReset: ResetIndex<DummyState> = {
    persistentState: false,
    nonPersistentState: true
  };

  const getResetReducer = (defaultState = DEFAULT_DUMMY_STATE) => {
    return makeResetReducer(
      combineReducers<DummyState>({
        persistentState: (state: any = defaultState.persistentState) => state,
        nonPersistentState: (state: any = defaultState.nonPersistentState) => state
      }),
      persistentStateToReset,
      defaultState
    );
  };

  it('should reset to right default value', () => {
    const resetReducer = getResetReducer();
    expect(
      resetReducer(DEFAULT_DUMMY_STATE, {type: RESET})
    ).toEqual(DEFAULT_DUMMY_STATE);
  });

  it('should reset bookmark when resetIndex is true', () => {
    const resetReducer = getResetReducer();
    expect(
      resetReducer(DEFAULT_DUMMY_STATE, {type: RESET})
    ).toEqual(DEFAULT_DUMMY_STATE);
    const newModifiedState = {
      ...DEFAULT_DUMMY_STATE,
      nonPersistentState: {
        ...DEFAULT_DUMMY_STATE.persistentState,
        nonPersistentProperty1: 1,
        nonPersistentProperty2: 2
      }
    };
    expect(
      resetReducer(newModifiedState, {type: 'NEWACTION'})
    ).toEqual(newModifiedState);

    expect(
      resetReducer(newModifiedState, {type: RESET})
    ).toEqual(DEFAULT_DUMMY_STATE);
  });

  it('should not reset config when resetIndex is false', () => {
    const modifiedDefaultState = {
      ...DEFAULT_DUMMY_STATE,
      persistentState: {
        persistentStateProperty1: 1
      }
    };
    const resetReducer = getResetReducer(modifiedDefaultState);
    expect(
      resetReducer(modifiedDefaultState, {type: RESET})
    ).toEqual(modifiedDefaultState);
    const newModifiedState = {
      ...modifiedDefaultState,
      persistentState: {
        persistentStateProperty2: 2,
        persistentStateProperty3: 3
      }
    };
    expect(
      resetReducer(newModifiedState, {type: RESET})
    ).toEqual(newModifiedState);
  });
});
