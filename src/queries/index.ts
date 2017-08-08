/**
 * Namespace for creating CompassQL query specifications.
 */

import {Query} from 'compassql/build/src/query/query';
import {isAggregate, SpecQuery} from 'compassql/build/src/query/spec';
import {Store} from 'redux';
import {StateWithHistory} from 'redux-undo';
import {NONSPATIAL_SCALE_CHANNELS} from 'vega-lite/build/src/channel';
import {contains} from 'vega-lite/build/src/util';
import {resultRequest} from '../actions/result';
import {StateBase} from '../models/index';
import {selectIsQuerySpecific} from '../selectors/index';
import {alternativeEncodings} from './alternative-encodings';
import {QueryCreator} from './base';
import {addCategoricalField, addQuantitativeField, addTemporalField} from './field-suggestions';
import {histograms} from './histograms';
import {summaries} from './summaries';

export function dispatchQueries(store: Store<StateWithHistory<StateBase>>, query: Query) {
  const state = store.getState();

  const isQueryEmpty = !query || query.spec.encodings.length === 0;
  const isQuerySpecific = selectIsQuerySpecific(state);

  store.dispatch(resultRequest('main', query));

  // FIXME clear other types of results

  if (isQueryEmpty) {
    store.dispatch(relatedViewResultRequest(histograms, query));
  } else {
    if (isQuerySpecific) {
      makeRelatedViewQueries(store, query);
    }
  }
}

function relatedViewResultRequest(queryCreator: QueryCreator, query: Query) {
  return resultRequest(queryCreator.type, queryCreator.createQuery(query));
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
    } else if (contains(NONSPATIAL_SCALE_CHANNELS, encQ.channel)) {
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

export function makeRelatedViewQueries(store: Store<StateWithHistory<StateBase>>, query: Query) {
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
