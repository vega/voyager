import * as React from 'react';

import {Channel, FieldDef} from '../../models';
import Field from '../Field';

export class EncodingShelf extends React.Component<{channel: Channel, fieldDef: FieldDef}, {}> {
  public render() {
    const {channel, fieldDef} = this.props;
    return (
      <div className="EncodingShelf">
        <span>{channel}</span>
        {fieldDef ? (<Field fieldDef={fieldDef}/>) : FieldPlaceholder()}
      </div>
    );
  }
}

function FieldPlaceholder() {
  return (
    <div className="FieldPlaceholder">
      Drop Field Here
    </div>
  );
}
