import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {PrimitiveType, Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as stringify from 'json-stable-stringify';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {FilterAction} from '../../actions/filter';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {SHELF_FIELD_AUTO_ADD, ShelfFieldAutoAdd} from '../../actions/shelf';
import {FieldParentType} from '../../constants';
import {State} from '../../models/index';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {selectPresetWildcardFields, selectSchema, selectSchemaFieldDefs} from '../../selectors';
import {Field} from '../field';
import * as styles from './field-list.scss';
import {TypeChanger} from './type-changer';


export interface FieldListProps extends ActionHandler<ShelfFieldAutoAdd | DatasetSchemaChangeFieldType | FilterAction> {
  fieldDefs: ShelfFieldDef[];
  schema: Schema;
}

class FieldListBase extends React.PureComponent<FieldListProps, {}> {

  constructor(props: FieldListProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
  }

  public render() {
    const {fieldDefs, schema} = this.props;
    const fieldItems = fieldDefs.map(fieldDef => {
      let primitiveType;
      if (!isWildcard(fieldDef.field)) {
        primitiveType = schema.primitiveType(fieldDef.field);
      }
      const hideTypeChanger = this.getValidTypes(primitiveType).length < 2;
      const key = isWildcard(fieldDef.field) ? stringify(fieldDef) : fieldDef.field;
      return (
        <div key={key} styleName="field-list-item">
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
      return this.renderField(fieldDef);
    } else {
      const popupComponent = this.renderTypeChanger(fieldDef, primitiveType);
      return this.renderField(fieldDef, popupComponent);
    }
  }

  private renderTypeChanger(fieldDef: ShelfFieldDef, primitiveType: PrimitiveType) {
    const {handleAction} = this.props;
    if (!isWildcard(fieldDef.field)) {
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

  private renderField(fieldDef: ShelfFieldDef, popupComponent?: JSX.Element) {
    const {schema, handleAction} = this.props;
    return (
      <Field
        fieldDef={fieldDef}
        isPill={true}
        draggable={true}
        filterShow={!isWildcard(fieldDef.field) && !(fieldDef.field === '*')}
        parentId={{type: FieldParentType.FIELD_LIST}}
        popupComponent={popupComponent}
        onDoubleClick={this.onAdd}
        onAdd={this.onAdd}
        schema={schema}
        handleAction={handleAction}
      />
    );
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
      fieldDefs: selectSchemaFieldDefs(state).concat([
        {fn: 'count', field: '*', type: 'quantitative', title: 'Number of Records'}
      ]),
      schema: selectSchema(state)
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);

export const PresetWildcardFieldList = connect(
  (state: State) => {
    return {
      fieldDefs: selectPresetWildcardFields(state),
      schema: selectSchema(state)
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);
