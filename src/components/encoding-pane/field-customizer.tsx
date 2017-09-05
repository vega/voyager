
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ActionHandler} from '../../actions/redux-action';
import {SpecEncodingAction} from '../../actions/shelf/spec';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec/encoding';
import * as styles from './field-customizer.scss';
import {PropertyEditor} from './property-editor';

export interface FieldCustomizerProps extends ActionHandler<SpecEncodingAction> {
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
}


export class FieldCustomizerBase extends React.PureComponent<FieldCustomizerProps, {}> {

  public render() {
    const {shelfId, handleAction, fieldDef} = this.props;
    return (
      <div styleName='customizer-container'>
        {this.customizableProps().map(customizableProp => {
          const {prop, nestedProp} = customizableProp;
          return (
            <PropertyEditor
              key={JSON.stringify({prop, nestedProp})}
              prop={prop}
              nestedProp={nestedProp}
              shelfId={shelfId}
              fieldDef={fieldDef}
              handleAction={handleAction}
            />
          );
        })}
      </div>
    );
  }

  private customizableProps() {
    return [{
      prop: 'scale',
      nestedProp: 'type'
    }];
  }
}

export const FieldCustomizer = CSSModules(FieldCustomizerBase, styles);
