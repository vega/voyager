import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import * as TetherComponent from 'react-tether';
import * as styles from './field-list.scss';

import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {PrimitiveType, Schema} from 'compassql/build/src/schema';
import {ShelfFieldDef} from '../../../build/src/models/shelf/encoding';
import {DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {SHELF_FIELD_AUTO_ADD, ShelfFieldAutoAdd} from '../../actions/shelf';
import {FieldParentType} from '../../constants';
import {State} from '../../models/index';
import {getPresetWildcardFields, getSchema, getSchemaFieldDefs} from '../../selectors';
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
    const fieldItems = fieldDefs.map(fieldDef => {
      let primitiveType;
      if (typeof fieldDef.field === 'string') {
        primitiveType = schema.primitiveType(fieldDef.field);
      }
      const hideTypeChanger = this.getValidTypes(primitiveType).length < 2;
      return (
        <div key={JSON.stringify(fieldDef)} styleName="field-list-item">
          {this.renderComponent(fieldDef, hideTypeChanger, primitiveType)}
        </div>
      );
    });
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

  private renderComponent(fieldDef: ShelfFieldDef, hideTypeChanger: boolean, primitiveType: PrimitiveType) {
    if (hideTypeChanger) {
      return this.renderField(fieldDef, hideTypeChanger);
    } else {
      return (
        <TetherComponent
          attachment="top left"
          targetAttachment="bottom left"
        >
        {this.renderField(fieldDef, hideTypeChanger)}
        {this.renderTypeChanger(fieldDef, primitiveType)}
        </TetherComponent>
      );
    }
  }

  private renderTypeChanger(fieldDef: ShelfFieldDef, primitiveType: PrimitiveType) {
    const {handleAction} = this.props;
    if (typeof fieldDef.field === 'string' && this.state.selectedField === fieldDef.field) {
      return (
        <TypeChanger
          field={fieldDef.field}
          type={fieldDef.type}
          validTypes={this.getValidTypes(primitiveType)}
          handleAction={handleAction}
        />
      );
    }
  }

  private renderField(fieldDef: ShelfFieldDef, hideTypeChanger: boolean) {
    return (
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
    );
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

  private getValidTypes(primitiveType: PrimitiveType): ExpandedType[] {
    switch (primitiveType) {
      case PrimitiveType.NUMBER:
        return [ExpandedType.QUANTITATIVE, ExpandedType.NOMINAL];
      case PrimitiveType.INTEGER:
        return [ExpandedType.QUANTITATIVE, ExpandedType.NOMINAL];
      case PrimitiveType.DATETIME:
        return [ExpandedType.TEMPORAL];
      case PrimitiveType.STRING:
        return [ExpandedType.NOMINAL];
      case PrimitiveType.BOOLEAN:
        return [ExpandedType.NOMINAL];
      default:
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
      schema: getSchema(state)
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);

export const PresetWildcardFieldList = connect(
  (state: State) => {
    return {
      fieldDefs: getPresetWildcardFields(state),
      schema: getSchema(state)
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);
