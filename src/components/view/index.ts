import {connect} from 'react-redux';

import {State, toSpecQuery} from '../../models';
import {View} from './view';

export const ViewContainer = connect(
  (state: State) => {
    // FIXME: use reselect
    const specQuery = toSpecQuery(state.shelf);
    return {specQuery: specQuery};
  }
)(View);
