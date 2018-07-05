/**
 * Namespace for creating CompassQL query specifications.
 */

import {getGroupByKey} from 'compassql/build/src/nest';
import {Query} from 'compassql/build/src/query/query';
import {isAggregate, SpecQuery} from 'compassql/build/src/query/spec';
import {contains} from 'compassql/build/src/util';
import {Store} from 'redux';
import {isString} from 'util';
import {NONPOSITION_SCALE_CHANNELS} from 'vega-lite/build/src/channel';
import {resultRequest} from '../actions/result';
import {State} from '../models/index';
import {ResultType} from '../models/result';
import {selectIsQuerySpecific} from '../selectors/index';
import {selectIsQueryEmpty} from '../selectors/shelf';
import {alternativeEncodings} from './alternative-encodings';
import {QueryCreator} from './base';
import {addCategoricalField, addQuantitativeField, addTemporalField} from './field-suggestions';
import {histograms} from './histograms';
import {summaries} from './summaries';


export const RELATED_VIEWS_INDEX: {[k in ResultType]: QueryCreator} = {
  main: undefined,
  addCategoricalField,
  addQuantitativeField,
  addTemporalField,
  alternativeEncodings,
  summaries,
  histograms,
};

const RELATED_VIEWS_PRIORITY: {[k in ResultType]: number} = {
  main: undefined,
  histograms: 0,
  summaries: 1,
  addQuantitativeField: 2,
  addCategoricalField: 3,
  addTemporalField: 4,
  alternativeEncodings: 5
};

export const RELATED_VIEWS_TYPES = Object.keys(RELATED_VIEWS_INDEX)
  .filter(type => type !== 'main')
  .sort((t1, t2) => RELATED_VIEWS_PRIORITY[t1] - RELATED_VIEWS_PRIORITY[t2]) as ResultType[];

export function dispatchQueries(store: Store<State>, query: Query) {
  const state = store.getState();

  const isQueryEmpty = selectIsQueryEmpty(state);
  const isQuerySpecific = selectIsQuerySpecific(state);
  store.dispatch(resultRequest('main', query, null));

  if (state.persistent.config.relatedViews === 'disabled' || state.persistent.relatedViews.isCollapsed) {
    return;
  }
  if (isQueryEmpty) {
    store.dispatch(relatedViewResultRequest(histograms, query));
  } else {
    if (isQuerySpecific) {
      makeRelatedViewQueries(store, query);
    }
  }
}

function relatedViewResultRequest(queryCreator: QueryCreator, mainQuery: Query) {
  const query = queryCreator.createQuery(mainQuery);

  let mainQueryKey;

  if (queryCreator.filterSpecifiedView) {
    if (!isString(query.groupBy)) {
      throw new Error('Cannot get key if query.groupBy is not string');
    }
    mainQueryKey = getGroupByKey(mainQuery.spec, query.groupBy);
  }
  return resultRequest(queryCreator.type, query, mainQueryKey);
}



function getFeaturesForRelatedViewRules(spec: SpecQuery) {
  let hasOpenPosition = false;
  let hasStyleChannel = false;
  let hasOpenFacet = false;

  spec.encodings.forEach(encQ => {
    if (encQ.channel === 'x' || encQ.channel === 'y') {
      hasOpenPosition = true;
    } else if (encQ.channel === 'row' || encQ.channel === 'column') {
      hasOpenFacet = true;
    } else if (contains(NONPOSITION_SCALE_CHANNELS, encQ.channel)) {
      hasStyleChannel = true;
    }
  });

  return {
    hasOpenPosition,
    hasStyleChannel,
    hasOpenFacet,
    isSpecAggregate: isAggregate(spec)
  };
}

export function makeRelatedViewQueries(store: Store<State>, query: Query) {
  const {hasOpenPosition, hasStyleChannel, hasOpenFacet, isSpecAggregate} = getFeaturesForRelatedViewRules(query.spec);

  if (!isSpecAggregate) {
    store.dispatch(relatedViewResultRequest(summaries, query));
  }

  if (hasOpenPosition || hasStyleChannel) {
    store.dispatch(relatedViewResultRequest(addQuantitativeField, query));
  }

  if (hasOpenPosition || hasStyleChannel || hasOpenFacet) {
    store.dispatch(relatedViewResultRequest(addCategoricalField, query));
  }

  if (hasOpenPosition) {
    store.dispatch(relatedViewResultRequest(addTemporalField, query));
  }

  store.dispatch(relatedViewResultRequest(alternativeEncodings, query));
}
