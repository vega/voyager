import * as React from 'react';
import * as CSSModules from 'react-css-modules';

import {FieldParentType} from '../../constants';
import {Schema} from '../../models';

import {Field} from '../field';
import * as styles from './field-list.scss';


export interface FieldListProps {
  schema: Schema;
}

class FieldListBase extends React.PureComponent<FieldListProps, {}> {
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
}

export const FieldList = CSSModules(FieldListBase, styles);
