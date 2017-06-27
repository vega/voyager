import * as React from 'react';
import * as CSSModules from 'react-css-modules';

import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import {DATASET_SCHEMA_CHANGE_FIELD_TYPE, DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {ActionHandler} from '../../actions/redux-action';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import * as styles from './type-changer.scss';

export interface TypeChangerProps extends ActionHandler<DatasetSchemaChangeFieldType> {
  fieldDef: ShelfFieldDef;
  types: ExpandedType[];
}

export interface TypeChangerState {
  selectedType: ExpandedType;
}

class TypeChangerBase extends React.PureComponent<TypeChangerProps, TypeChangerState> {
  constructor(props: TypeChangerProps) {
    super(props);
    this.state = {
      selectedType: this.props.fieldDef.type
    };
  }
  public render() {
    const {types} = this.props;
    return (
      <div styleName='type-changer'>
        <h4>Type</h4>
        {types.map(ele => {
          return (
            <label key={ele}>
              <input type='radio' value={ele} name='type'
                onChange={this.onTypeChange.bind(this)}
                checked={this.state.selectedType === ele}
              />
              <span styleName='type'> {ele} </span>
            </label>
          );
        })}
      </div>
    );
  }

  protected onTypeChange(e: any) {
    const type = e.target.value;
    const {handleAction, fieldDef} = this.props;
    handleAction({
      type: DATASET_SCHEMA_CHANGE_FIELD_TYPE,
      payload: {
        field: fieldDef.field.toString(),
        type: type
      }
    });
    this.setState({
      selectedType: type
    });
  }
}

export const TypeChanger = CSSModules(TypeChangerBase, styles);
