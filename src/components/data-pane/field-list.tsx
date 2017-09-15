import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {PrimitiveType, Schema} from 'compassql/build/src/schema';
import {isWildcard, isWildcardDef} from 'compassql/build/src/wildcard';
import * as stringify from 'json-stable-stringify';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {FilterAction} from '../../actions';
import {CUSTOM_WILDCARD_ADD_FIELD, CUSTOM_WILDCARD_REMOVE,
        CustomWildcardAction} from '../../actions/custom-wildcard-field';
import {DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {SPEC_FIELD_AUTO_ADD, SpecFieldAutoAdd} from '../../actions/shelf';
import {FILTER_TOGGLE} from '../../actions/shelf/filter';
import {FieldParentType} from '../../constants';
import {CustomWildcardFieldDef} from '../../models/custom-wildcard-field';
import {State} from '../../models/index';
import {ShelfFieldDef} from '../../models/shelf';
import {createDefaultFilter, filterHasField} from '../../models/shelf/filter';
import {selectPresetWildcardFields, selectSchema, selectSchemaFieldDefs} from '../../selectors';
import {selectCustomWildcardFieldDefs} from '../../selectors/index';
import {selectFilters} from '../../selectors/shelf';
import {Field} from '../field';
import {DroppableField} from '../field/index';
import * as styles from './field-list.scss';
import {TypeChanger} from './type-changer';
import {CustomWildcardFieldEditor} from './wildcard-field-editor';


export interface FieldListProps extends ActionHandler<
  CustomWildcardAction | SpecFieldAutoAdd | DatasetSchemaChangeFieldType | FilterAction> {
  fieldDefs: ShelfFieldDef[];
  schema: Schema;
  filters: Array<RangeFilter | OneOfFilter>;
}

class FieldListBase extends React.PureComponent<FieldListProps, {}> {

  constructor(props: FieldListProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
    this.onFilterToggle = this.onFilterToggle.bind(this);
  }

  public render() {
    const {fieldDefs} = this.props;
    const fieldItems = fieldDefs.map((fieldDef, index) => this.renderListItem(fieldDef, index));
    return (
      <div styleName='field-list'>
        {fieldItems}
      </div>
    );
  }

  protected onAdd(fieldDef: ShelfFieldDef) {
    const {handleAction} = this.props;
    handleAction({
      type: SPEC_FIELD_AUTO_ADD,
      payload: {fieldDef: fieldDef}
    });
  }

  protected onFilterToggle(fieldDef: ShelfFieldDef): void {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_TOGGLE,
      payload: {
        filter: this.getFilter(fieldDef)
      }
    });
  }

  private getFilter(fieldDef: ShelfFieldDef) {
    const {schema} = this.props;
    if (isWildcard(fieldDef.field)) {
      return;
    }
    const domain = schema.domain({field: fieldDef.field});
    return createDefaultFilter(fieldDef, domain);
  }

  private renderListItem(fieldDef: ShelfFieldDef, index: number) {
    const {schema, filters, handleAction} = this.props;
    const key = isWildcard(fieldDef.field) ? stringify(fieldDef) : fieldDef.field;

    let popupComponent;
    const isCustomWildcardField = isWildcardDef(fieldDef.field);

    if (!isWildcard(fieldDef.field)) {
      const primitiveType = schema.primitiveType(fieldDef.field);

      if (this.getValidTypes(primitiveType).length < 2) {
        popupComponent = this.renderTypeChanger(fieldDef, primitiveType);
      }
    } else {
      if (isCustomWildcardField) {
        popupComponent = (
          <CustomWildcardFieldEditor
            customWildcardFielddef={fieldDef as CustomWildcardFieldDef}
            index={index}
            handleAction={handleAction}
          />
        );
      }
    }

    const filter = {
      active: !isWildcard(fieldDef.field) && filterHasField(filters, fieldDef.field),
      onToggle: this.onFilterToggle
    };

    function onDrop(droppedFieldDef: ShelfFieldDef) {
      const type = fieldDef.type;
      if (type === droppedFieldDef.type) {
        let fields: string[];
        if (isWildcard(droppedFieldDef.field)) {
          if (droppedFieldDef.field === '?') {
            fields = schema.fieldNames()
                       .filter(field => schema.vlType(field) === type);
          } else {
            fields = droppedFieldDef.field.enum.concat([]);
          }
        } else {
          fields = [droppedFieldDef.field];
        }

        handleAction({
          type: CUSTOM_WILDCARD_ADD_FIELD,
          payload: {
            fields,
            index
          }
        });
      } else {
        window.alert('Cannot create a wildcard that mixes multiple types');
      }
    }

    function onRemove() {
      handleAction({
        type: CUSTOM_WILDCARD_REMOVE,
        payload: {
          index
        }
      });
    }

    const FieldComponent = isCustomWildcardField ? DroppableField : Field;

    const field = (
      <FieldComponent
        fieldDef={fieldDef}
        isPill={true}
        draggable={true}
        filter={filter}
        parentId={{type: FieldParentType.FIELD_LIST}}
        caretShow={true}
        popupComponent={popupComponent}
        onDoubleClick={this.onAdd}
        onAdd={this.onAdd}
        onDrop={isCustomWildcardField ? onDrop : undefined}
        onRemove={isCustomWildcardField ? onRemove : undefined}
        schema={schema}
      />
    );

    return (
      <div key={key} styleName="field-list-item">
        {field}
      </div>
    );
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
        {fn: 'count', field: '*', type: 'quantitative'}
      ]),
      schema: selectSchema(state),
      filters: selectFilters(state)
    };
  },
  createDispatchHandler<SpecFieldAutoAdd>()
)(FieldListRenderer);

export const PresetWildcardFieldList = connect(
  (state: State) => {
    return {
      fieldDefs: selectPresetWildcardFields(state),
      schema: selectSchema(state),
      filters: selectFilters(state)
    };
  },
  createDispatchHandler<SpecFieldAutoAdd>()
)(FieldListRenderer);


export const CustomWildcardFieldList = connect(
  (state: State) => {
    return {
      // Somehow TS does not infer type that CustomWildcardFieldDefs can be a ShelfFieldDef
      fieldDefs: selectCustomWildcardFieldDefs(state) as ShelfFieldDef[],
      schema: selectSchema(state),
      filters: selectFilters(state)
    };
  },
  createDispatchHandler<SpecFieldAutoAdd | CustomWildcardAction>()
)(FieldListRenderer);
