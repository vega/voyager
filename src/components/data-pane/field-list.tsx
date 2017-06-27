import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import * as TetherComponent from 'react-tether';
import * as styles from './field-list.scss';

import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {PrimitiveType, Schema, FieldSchema} from 'compassql/build/src/schema';
import {DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {SHELF_FIELD_AUTO_ADD, ShelfFieldAutoAdd} from '../../actions/shelf';
import {FieldParentType} from '../../constants';
import {State} from '../../models/index';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {getPresetWildcardFields, getSchemaFieldDefs} from '../../selectors';
import {Field} from '../field';
import {TypeChanger} from './type-changer';


export interface FieldListProps extends ActionHandler<ShelfFieldAutoAdd | DatasetSchemaChangeFieldType> {
  fieldDefs: ShelfFieldDef[];
  schema: Schema;
}

export interface FieldListState {
  selectedField: string;
}

class FieldListBase extends React.PureComponent<FieldListProps, FieldListState> {

  constructor(props: FieldListProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
    this.state = {
      selectedField: null
    };
  }

  public render() {
    const {fieldDefs, schema} = this.props;
    const fieldItems = [];
    for (let i = 0; i < fieldDefs.length; i++) {
      const fieldDef = fieldDefs[i];
      const fieldSchemas = schema.fieldSchemas;
      let type: PrimitiveType;
      if (fieldSchemas && fieldSchemas[i]) {
        type = fieldSchemas[i].type;
      }
      const hideTypeChanger = (type !== PrimitiveType.NUMBER && type !== PrimitiveType.INTEGER)
        || fieldDef.field === '?';
      fieldItems.push (
        <div key={JSON.stringify(fieldDef)} styleName="field-list-item">
          <TetherComponent
             attachment="top left"
             targetAttachment="bottom left">
             <Field
              fieldDef={fieldDef}
              isPill={true}
              draggable={true}
              parentId={{type: FieldParentType.FIELD_LIST}}
              caretHide={hideTypeChanger}
              caretOnClick={this.handleCaretClick.bind(this, fieldDef.field)}
              onDoubleClick={this.onAdd}
              onAdd={this.onAdd}
            />
            {!hideTypeChanger && this.renderTypeChanger(fieldDef, type)}
          </TetherComponent>
      </div>);
    }

    return (
      <div className="FieldList">
        {fieldItems}
      </div>
    );
  }

  protected onAdd(fieldDef: ShelfFieldDef) {
    const {handleAction} = this.props;
    handleAction({
      type: SHELF_FIELD_AUTO_ADD,
      payload: {fieldDef: fieldDef}
    });
  }

  private renderTypeChanger(fieldDef: ShelfFieldDef, primitiveType: PrimitiveType) {
    const {handleAction} = this.props;
    if (typeof fieldDef.field === 'string' && this.state.selectedField === fieldDef.field) {
      return (
        <TypeChanger
          field={fieldDef.field}
          type={fieldDef.type}
          types={this.getTypes(primitiveType)}
          handleAction={handleAction}
        />
      );
    }
  }

  private handleCaretClick(field: string) {
    if (this.state.selectedField === field) {
      this.setState({
        selectedField: null
      });
    } else {
      this.setState({
        selectedField: field
      });
    }
  }

  private getTypes(primitiveType: PrimitiveType): ExpandedType[] {
    if (primitiveType === PrimitiveType.NUMBER) {
      return [ExpandedType.QUANTITATIVE, ExpandedType.NOMINAL];
    } else {
      return [];
    }
  }
}

const FieldListRenderer = CSSModules(FieldListBase, styles);

export const FieldList = connect(
  (state: State) => {
    return {
      fieldDefs: getSchemaFieldDefs(state).concat([
        {aggregate: 'count', field: '*', type: 'quantitative', title: 'Number of Records'}
      ]),
      schema: state.present.dataset.schema
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);

export const PresetWildcardFieldList = connect(
  (state: State) => {
    return {
      fieldDefs: getPresetWildcardFields(state),
      schema: state.present.dataset.schema
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);
