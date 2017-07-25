import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DATASET_SCHEMA_CHANGE_FIELD_TYPE, DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {ActionHandler} from '../../actions/redux-action';
import * as styles from './type-changer.scss';

export interface TypeChangerProps extends ActionHandler<DatasetSchemaChangeFieldType> {
  field: string;
  type: ExpandedType;
  validTypes: ExpandedType[];
}

export class TypeChangerBase extends React.PureComponent<TypeChangerProps, {}> {
  public render() {
    const {validTypes} = this.props;
    return (
      <div styleName='type-changer'>
        <h4>Type</h4>
        {validTypes.map(validType => {
          return (
            <label key={validType}>
              <input type='radio' value={validType} name='type'
                onChange={this.onTypeChange.bind(this)}
                checked={this.props.type === validType}
              />
              <span styleName='type'> {validType} </span>
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
