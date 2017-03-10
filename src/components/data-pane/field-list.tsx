import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as styles from './field-list.scss';

import {ActionHandler} from '../../actions/redux-action';
import {SHELF_FIELD_AUTO_ADD, ShelfFieldAutoAdd} from '../../actions/shelf';
import {FieldParentType} from '../../constants';
import {Schema} from '../../models';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {Field} from '../field';


export interface FieldListProps extends ActionHandler<ShelfFieldAutoAdd> {
  schema: Schema;
}

class FieldListBase extends React.PureComponent<FieldListProps, {}> {

  constructor(props: FieldListProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onAdd = this.onAdd.bind(this);
  }

  public render() {
    const {schema} = this.props;

    const fieldItems = schema.fieldSchemas.map(fieldSchema => {
      const {field, type} = fieldSchema;
      const fieldDef = {field, type};

      // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
      const F = Field as any;
      return (
        <div key={field} styleName="field-list-item">
          <F
            fieldDef={fieldDef}
            isPill={true}
            draggable={true}
            parentId={{type: FieldParentType.FIELD_LIST}}

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

export const FieldList = CSSModules(FieldListBase, styles);
