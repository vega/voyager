import * as React from 'react';

import {Channel} from 'vega-lite/src/channel';
import {FieldDef} from 'vega-lite/src/FieldDef';

export class EncodingShelf extends React.Component<{channel: Channel, fieldDef: FieldDef}, {}> {
  public render() {
    const {channel, fieldDef} = this.props;
    return (
      <div className='EncodingShelf'>
        <span>{channel}</span>
        {fieldDef ? FieldInfo({fieldDef}) : FieldPlaceholder()}
      </div>
    );
  }
}

interface FieldInfoProps {
  fieldDef: FieldDef;
}

function FieldInfo(props: FieldInfoProps) {
  const fieldDef = props.fieldDef;
  return (
    <div className="FieldInfo">
      {fieldDef.field}
    </div>
  );
}

function FieldPlaceholder() {
  return (
    <div className="FieldPlaceholder">
      Drop Field Here
    </div>
  );
}
