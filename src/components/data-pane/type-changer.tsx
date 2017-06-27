import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DATASET_SCHEMA_CHANGE_FIELD_TYPE, DatasetSchemaChangeFieldType} from '../../actions/dataset';
import { ActionHandler, createDispatchHandler } from '../../actions/redux-action';
import { ShelfFieldDef } from '../../models/shelf/encoding';
import * as styles from './type-changer.scss';
import { connect } from 'react-redux';

export interface TypeChangerProps extends ActionHandler<DatasetSchemaChangeFieldType> {
  fieldDef: ShelfFieldDef;
  types: ExpandedType[];
}

class TypeChangerBase extends React.Component<TypeChangerProps, {}> {

  public render() {
    return (
      <div styleName='type-changer'>
        <h4>Type</h4>
        {this.props.types.map(ele => {
          return (
            <label key={ele}>
              <input type='radio' value={ele} name='type'
              onChange={this.onFieldTypeChange.bind(this, this.props.fieldDef.field, this.props.fieldDef.type)}/>
              <span styleName='type'> {ele} </span>
            </label>
          );
        })}
      </div>
    );
  }

  protected onFieldTypeChange(field: string, type: ExpandedType) {
    const {handleAction} = this.props;
    handleAction({
      type: DATASET_SCHEMA_CHANGE_FIELD_TYPE,
      payload: {
        field: field,
        type: type
      }
    });
  }
}

const TypeChangerRenderer = CSSModules(TypeChangerBase, styles);

export const TypeChanger = connect(
  createDispatchHandler<DatasetSchemaChangeFieldType>()
)(TypeChangerRenderer);
