import {connect} from 'react-redux';

import {State} from '../../models';
import {DataPanel} from './data';

export const DataContainer = connect(
  (state: State) => {
    // FIXME: use reselect
    return {data: state.data};
  }
)(DataPanel);
