import {Store} from 'redux';
import {StateWithHistory} from 'redux-undo';
import {StateBase} from '../models/index';


function currentTime() {
  return Date.now();
}

export const benchmark = (store: Store<StateWithHistory<Readonly<StateBase>>>) => (next: any) => (action: any) => {
  const start = currentTime();
  const result = next( action );
  const end = currentTime();
  console.log( `Action with type "${action.type}" took ${( end - start ).toFixed( 2 )} milliseconds.` );
  return result;
};
