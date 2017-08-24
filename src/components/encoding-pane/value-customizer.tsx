
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ActionHandler} from '../../actions/redux-action';
import {SpecEncodingAction} from '../../actions/shelf/spec';
import {ShelfId, ShelfValueDef} from '../../models/shelf/spec/encoding';
import * as styles from './field-customizer.scss';

export interface ValueCustomizerProps extends ActionHandler<SpecEncodingAction> {
  shelfId: ShelfId;
  valueDef: ShelfValueDef;
}


export class ValueCustomizerBase extends React.PureComponent<ValueCustomizerProps, {}> {

  public render() {
    // const {shelfId, handleAction, valueDef} = this.props;
    return (
      <div styleName='customizer-container'>
        this is value customizer :P
      </div>
    );
  }

  // private customizableProps() {
  //   return [{
  //     prop: 'value',
  //     nestedProp: ''
  //   }];
  // }
}

export const ValueCustomizer = CSSModules(ValueCustomizerBase, styles);
