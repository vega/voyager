import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import * as styles from './field-list.scss';

import * as TetherComponent from 'react-tether';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {SHELF_FIELD_AUTO_ADD, ShelfFieldAutoAdd} from '../../actions/shelf';
import {FieldParentType} from '../../constants';
import {State} from '../../models/index';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {getPresetWildcardFields, getSchemaFieldDefs} from '../../selectors';
import {Field} from '../field';
import {TypeChanger} from './type-changer';


export interface FieldListProps extends ActionHandler<ShelfFieldAutoAdd> {
  fieldDefs: ShelfFieldDef[];
}

class FieldListBase extends React.PureComponent<FieldListProps, any> {

  constructor(props: FieldListProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
    this.state = ({
      selectedField: null,
      currFields: JSON.parse(JSON.stringify(this.props.fieldDefs)) // a deep copy of fieldDefs
    });
  }

  public componentWillReceiveProps(nextProps: FieldListProps) {
    if (this.props.fieldDefs !== nextProps.fieldDefs && nextProps.fieldDefs !== undefined) {
      this.setState({
        selectedField: null,
        currFields: JSON.parse(JSON.stringify(nextProps.fieldDefs)) // a deep copy of fieldDefs
      });
    }
  }

  public render() {
    const {fieldDefs} = this.props;
    const fieldItems = fieldDefs.map(fieldDef => {
      const hideTypeChanger = fieldDef.type !== 'quantitative' || fieldDef.field === '?' || fieldDef.field === '*';
      return (
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
              caretOnClick={this.handleCaretClick.bind(this, fieldDef)}
              onDoubleClick={this.onAdd}
              onAdd={this.onAdd}
              currType={this.getCurrType(fieldDef)}
            />
            {!hideTypeChanger && this.state.selectedField === fieldDef &&
            <TypeChanger
              fieldDef={fieldDef}
              changeType={this.changeType.bind(this, fieldDef)}
            />}
          </TetherComponent>
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

  private getCurrType(fieldDef: ShelfFieldDef) {
    const currField = this.findField(fieldDef, this.state.currFields);
    if (currField !== undefined) {
      return currField.type;
    }
  }

  private findField(target: ShelfFieldDef, fields: ShelfFieldDef[]) {
    for (const field of fields) {
      if (field.field === target.field) {
        return field;
      }
    }
  }

  private handleCaretClick(fieldDef: ShelfFieldDef) {
    if (this.state.selectedField === fieldDef) {
      this.setState({
        selectedField: null
      });
    } else {
      this.setState({
        selectedField: fieldDef
      });
    }
  }

  private changeType(fieldDef: ShelfFieldDef, e: any) {
    const currField = this.findField(fieldDef, this.state.currFields);
    if (currField !== undefined) {
      const temp = this.state.currFields;
      currField.type = e.target.value;
      // re-render fields
      this.setState({
        currSelectedField: temp
      });
    }
  }
}

const FieldListRenderer = CSSModules(FieldListBase, styles);

export const FieldList = connect(
  (state: State) => {
    return {
      fieldDefs: getSchemaFieldDefs(state).concat([
        {aggregate: 'count', field: '*', type: 'quantitative', title: 'Number of Records'}
      ])
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);

export const PresetWildcardFieldList = connect(
  (state: State) => {
    return {
      fieldDefs: getPresetWildcardFields(state)
    };
  },
  createDispatchHandler<ShelfFieldAutoAdd>()
)(FieldListRenderer);
