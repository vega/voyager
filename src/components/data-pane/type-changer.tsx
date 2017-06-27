import * as React from 'react';
import * as CSSModules from 'react-css-modules';

import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {DATASET_SCHEMA_CHANGE_FIELD_TYPE, DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {ActionHandler} from '../../actions/redux-action';
import * as styles from './type-changer.scss';

export interface TypeChangerProps extends ActionHandler<DatasetSchemaChangeFieldType> {
  field: string;
  type: ExpandedType;
  types: ExpandedType[];
}

class TypeChangerBase extends React.PureComponent<TypeChangerProps, {}> {
  public render() {
    const {types} = this.props;
    return (
      <div styleName='type-changer'>
        <h4>Type</h4>
        {types.map(type => {
          return (
            <label key={type}>
              <input type='radio' value={type} name='type'
                onChange={this.onTypeChange.bind(this)}
                checked={this.props.type === type}
              />
              <span styleName='type'> {type} </span>
            </label>
          );
        })}
      </div>
    );
  }

  protected onTypeChange(e: any) {
    const type = e.target.value;
    const {handleAction, field} = this.props;
    handleAction({
      type: DATASET_SCHEMA_CHANGE_FIELD_TYPE,
      payload: {
        field: field,
        type: type
      }
    });
  }
}

export const TypeChanger = CSSModules(TypeChangerBase, styles);
