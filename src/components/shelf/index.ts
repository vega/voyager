import {connect} from 'react-redux';
import {Shelf} from './shelf';

import {Mark} from 'vega-lite/src/mark';
import {State} from '../../models';


export const ShelfContainer = connect(
  (state: State) => {
    return {shelf: state.shelf};
  },
  (dispatch) => {
    return {
      onMarkChange: (mark: Mark) => {
        dispatch({
          type: 'shelf-mark-change-type',
          mark: mark
        });
      }
    };
  }
)(Shelf);
