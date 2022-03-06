import {isArray} from 'util';
import {EncodingWithFacet} from 'vega-lite/build/src/encoding';
import {FieldDef, isFieldDef} from 'vega-lite/build/src/channeldef';
import {
  Action,
  RESULT_RECEIVE,
  RESULT_REQUEST,
} from '../actions';
import {
  isResultAction,
  RESULT_LIMIT_INCREASE,
  RESULT_MODIFY_FIELD_PROP,
  RESULT_MODIFY_NESTED_FIELD_PROP,
  ResultAction,
  ResultModifyAction
} from '../actions/result';
import {DEFAULT_RESULT, DEFAULT_RESULT_INDEX, Result, ResultIndex} from '../models';
import {ResultType} from '../models/result';
import {ResultPlot} from '../models/result/plot';
import {modifyFieldProp, modifyNestedFieldProp} from './shelf/spec';
import {modifyItemInArray} from './util';

export const DEFAULT_LIMIT: {[K in ResultType]: number} = {
  main: 12,
  addCategoricalField: 4,
  addQuantitativeField: 4,
  addTemporalField: 2,
  alternativeEncodings: 2,
  summaries: 2,
  histograms: 12
};

function resultReducer(state: Readonly<Result> = DEFAULT_RESULT, action: ResultAction, resultType: ResultType): Result {
  switch (action.type) {
    case RESULT_REQUEST:
      return {
        ...state,
        isLoading: true,
        plots: undefined,
        query: undefined,
        limit: DEFAULT_LIMIT[resultType]
      };
    case RESULT_RECEIVE: {
      const {plots, query} = action.payload;
      return {
        ...state,
        isLoading: false,
        plots,
        query
      };
    }
    case RESULT_LIMIT_INCREASE:
      const {increment} = action.payload;
      return {
        ...state,
        limit: state.limit + increment
      };

    case RESULT_MODIFY_FIELD_PROP:
    case RESULT_MODIFY_NESTED_FIELD_PROP: {
      const {index} = action.payload;
      return {
        ...state,
        plots: modifyItemInArray<ResultPlot>(state.plots, index, (p: ResultPlot) => {
          return {
            ...p,
            spec: {
              ...p.spec,
              encoding: resultPlotSpecModifyFieldReducer(p.spec.encoding, action)
            }
          };
        })
      };
    }
  }
  return state;
}

function resultPlotSpecModifyFieldReducer(encoding: EncodingWithFacet<any>, action: ResultModifyAction) {
  const {channel, prop, value} = action.payload;
  const channelDef = encoding[channel];
  if (!channelDef) {
    console.error(`${action.type} no working for channel ${channel} without field.`);
  } else if (isArray(channelDef)) {
    console.error(`${action.type}  not supported for detail and order`);
    return encoding;
  } else if (!isFieldDef<any>(channelDef)) {
    console.error(`${action.type}  not supported for detail and order`);
    return encoding;
  }
  const fieldDef = encoding[channel] as FieldDef<any>;
  switch (action.type) {
    case RESULT_MODIFY_FIELD_PROP:
      return {
        ...encoding,
        [channel]: modifyFieldProp(fieldDef, prop, value)
      };

    case RESULT_MODIFY_NESTED_FIELD_PROP: {
      const {nestedProp} = action.payload;
      return {
        ...encoding,
        [channel]: modifyNestedFieldProp(fieldDef, prop, nestedProp, value)
      };
    }
  }

  return encoding;
}

export function resultIndexReducer(state: Readonly<ResultIndex> = DEFAULT_RESULT_INDEX, action: Action): ResultIndex {
  if (isResultAction(action)) {
    const {resultType} = action.payload;
    return {
      ...(
        action.type === RESULT_REQUEST && resultType === 'main' ?
          // When making a main query result request, reset all other results
          // as the older related views results will be outdated anyway.
          DEFAULT_RESULT_INDEX :
          state
      ),
      [resultType]: resultReducer(state[resultType], action, resultType)
    };
  }
  return state;
}
