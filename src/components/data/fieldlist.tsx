import * as React from 'react';
import {Schema} from '../../models';

export interface FieldListProps {
  schema: Schema;
}

export class FieldList extends React.Component<FieldListProps, {}> {
  public render() {
    const {schema} = this.props;

    const fieldItems = schema.fieldSchemas.map(fieldSchema => (
      <div key={fieldSchema.field}>
        {fieldSchema.field} ({fieldSchema.type.charAt(0)})
      </div>
    ));

    return (
      <div className="FieldList">
        {fieldItems}
      </div>
    );
  }
}
