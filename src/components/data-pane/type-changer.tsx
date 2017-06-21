import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import { ShelfFieldDef } from '../../models/shelf/encoding';
import * as styles from './type-changer.scss';

export interface TypeChangerProps {
  fieldDef: ShelfFieldDef;
  changeType: any;
}

class TypeChangerBase extends React.Component<TypeChangerProps, {}> {

  public render() {
    const types = this.getTypes();
    return (
      <div styleName='type-changer'>
        <h4>Type</h4>
        {types.map(ele => {
          return (
            <label key={ele}>
              <input type='radio' value={ele} name='type' onChange={this.props.changeType.bind(this)}/>
              <span styleName='type'> {ele} </span>
            </label>
          );
        })}
      </div>
    );
  }

  private getTypes() {
    if (this.props.fieldDef.type === 'quantitative') {
      return ['nominal', 'quantitative'];
    } else {
      return [];
    }
  }
}

export const TypeChanger = CSSModules(TypeChangerBase, styles);
