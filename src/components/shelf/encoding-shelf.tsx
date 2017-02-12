import * as React from 'react';

import {Channel} from 'vega-lite/src/channel';
import {FieldDef} from 'vega-lite/src/FieldDef';

export class EncodingShelf extends React.Component<{channel: Channel, fieldDef: FieldDef}, {}> {
  public render() {
    return (
      <div className="encodingShelf">
        <span>{this.props.channel}</span>
        {this.props.fieldDef.field}
      </div>
    );
  }
}
