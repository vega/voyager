import * as React from 'react';
import {Schema} from '../../models';

import Field from '../Field';


export interface FieldListProps {
  schema: Schema;
}

export class FieldList extends React.Component<FieldListProps, {}> {
  public render() {
    const {schema} = this.props;

    const fieldItems = schema.fieldSchemas.map(fieldSchema => {
      const field = fieldSchema.field;
      return (
        <Field key={field} fieldDef={fieldSchema}/>
      );
    });

    return (
      <div className="FieldList">
        {fieldItems}
      </div>
    );
  }
}
