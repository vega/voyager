import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import * as styles from './field-list.scss';

import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {SHELF_FIELD_AUTO_ADD, ShelfFieldAutoAdd} from '../../actions/shelf';
import {FieldParentType} from '../../constants';
import {State} from '../../models/index';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {getPresetWildcardFields, getSchemaFieldDefs} from '../../selectors';
import {Field} from '../field';


export interface FieldListProps extends ActionHandler<ShelfFieldAutoAdd> {
  fieldDefs: ShelfFieldDef[];
}

class FieldListBase extends React.PureComponent<FieldListProps, {}> {

  constructor(props: FieldListProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
  }

  public render() {
    const {fieldDefs} = this.props;

    const fieldItems = fieldDefs.map(fieldDef => {
      return (
        <div key={JSON.stringify(fieldDef)} styleName="field-list-item">
          <Field
            fieldDef={fieldDef}
            isPill={true}
            draggable={true}
            parentId={{type: FieldParentType.FIELD_LIST}}

            onDoubleClick={this.onAdd}
            onAdd={this.onAdd}
          />
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
