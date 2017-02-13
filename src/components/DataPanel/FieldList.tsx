import * as React from 'react';
import {Schema} from '../../models';

import FieldInfo from '../FieldInfo';


export interface FieldListProps {
  schema: Schema;
}

export class FieldList extends React.Component<FieldListProps, {}> {
  public render() {
    const {schema} = this.props;

    const fieldItems = schema.fieldSchemas.map(fieldSchema => {
      const field = fieldSchema.field;
      return (
        <FieldInfo key={field} fieldDef={fieldSchema}/>
      );
    });

    return (
      <div className="FieldList">
        {fieldItems}
      </div>
    );
  }
}
