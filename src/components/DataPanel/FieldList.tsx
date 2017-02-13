import * as React from 'react';
import {Schema} from '../../models';

import {Field} from '../Field';


export interface FieldListProps {
  schema: Schema;
}

export class FieldList extends React.Component<FieldListProps, {}> {
  public render() {
    const {schema} = this.props;

    const fieldItems = schema.fieldSchemas.map(fieldSchema => {
      const {field, type} = fieldSchema;
      const fieldDef = {field, type};

      // HACK: add alias to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
      const F = Field as any;
      return (
        <F key={field} fieldDef={fieldDef} draggable={true}/>
      );
    });

    return (
      <div className="FieldList">
        {fieldItems}
      </div>
    );
  }
}
