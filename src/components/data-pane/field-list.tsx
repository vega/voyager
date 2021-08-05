import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {PrimitiveType, Schema} from 'compassql/build/src/schema';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as stringify from 'json-stable-stringify';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {FieldOneOfPredicate, FieldRangePredicate} from 'vega-lite/build/src/predicate';
import {FilterAction} from '../../actions';
import {DatasetSchemaChangeFieldType} from '../../actions/dataset';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {SPEC_FIELD_AUTO_ADD, SpecFieldAutoAdd} from '../../actions/shelf';
import {FILTER_TOGGLE} from '../../actions/shelf/filter';
import {FieldParentType} from '../../constants';
import {VoyagerConfig} from '../../models/config';
import {State} from '../../models/index';
import {ShelfFieldDef} from '../../models/shelf';
import {createDefaultFilter, filterHasField} from '../../models/shelf/filter';
import {selectConfig, selectPresetWildcardFields, selectSchema, selectSchemaFieldDefs} from '../../selectors';
import {selectFilters} from '../../selectors/shelf';
import {Field} from '../field';
import * as styles from './field-list.scss';
import {TypeChanger} from './type-changer';



export interface FieldListProps extends ActionHandler<SpecFieldAutoAdd | DatasetSchemaChangeFieldType | FilterAction> {
  config: VoyagerConfig;
  fieldDefs: ShelfFieldDef[];
  schema: Schema;
  filters: Array<FieldRangePredicate | FieldOneOfPredicate>;
}

class FieldListBase extends React.PureComponent<FieldListProps, {}> {

  constructor(props: FieldListProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
    this.onFilterToggle = this.onFilterToggle.bind(this);
  }

  public render() {
    const {config, fieldDefs, schema} = this.props;
    const fieldItems = fieldDefs.map(fieldDef => {
      let primitiveType;
      if (!isWildcard(fieldDef.field)) {
        primitiveType = schema.primitiveType(fieldDef.field);
      }
      const hideTypeChanger = this.getValidTypes(primitiveType).length < 2;
      const key = isWildcard(fieldDef.field) ? stringify(fieldDef) : fieldDef.field;
      return (
        <div key={key} styleName='field-list-item'>
          {this.renderComponent(fieldDef, hideTypeChanger, primitiveType)}
        </div>
      );
    });

    return (
      <div styleName={(config.wildcards === 'disabled') ? 'field-list-no-wildcards' : 'field-list'}>
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
    const {schema, filters} = this.props;
    const filter = {
      active: !isWildcard(fieldDef.field) && filterHasField(filters, fieldDef.field),
      onToggle: this.onFilterToggle
    };

    return (
      <Field
        fieldDef={fieldDef}
        isPill={true}
        draggable={true}
        filter={filter}
        parentId={{type: FieldParentType.FIELD_LIST as FieldParentType.FIELD_LIST}}
        caretShow={true}
        popupComponent={popupComponent}
        onDoubleClick={this.onAdd}
        onAdd={this.onAdd}
        schema={schema}
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
        {fn: 'count', field: '*', type: 'quantitative'}
      ]),
      schema: selectSchema(state),
      filters: selectFilters(state),
      config: selectConfig(state)
    };
  },
  createDispatchHandler<SpecFieldAutoAdd>()
)(FieldListRenderer);

export const PresetWildcardFieldList = connect(
  (state: State) => {
    return {
      fieldDefs: selectPresetWildcardFields(state),
      schema: selectSchema(state),
      config: selectConfig(state)
    };
  },
  createDispatchHandler<SpecFieldAutoAdd>()
)(FieldListRenderer);
