import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as styles from './field-list.scss';

import {ActionHandler} from '../../actions/redux-action';
import {SHELF_FIELD_AUTO_ADD, ShelfFieldAutoAdd} from '../../actions/shelf';
import {FieldParentType} from '../../constants';
import {ShelfFieldDef} from '../../models/shelf/encoding';
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
      // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
      const F = Field as any;
      return (
        <div key={JSON.stringify(fieldDef)} styleName="field-list-item">
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
