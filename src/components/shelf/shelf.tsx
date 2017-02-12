import * as React from 'react';

import {UnitShelf} from '../../models';

import {EncodingShelf} from './encoding-shelf';
import {MarkShelf} from './mark-shelf';

import {Channel} from 'vega-lite/src/channel';
import {Mark} from 'vega-lite/src/mark';

interface ShelfProps {
  // Props
  shelf: UnitShelf;

  // Dispatch
  onMarkChange: (mark: Mark) => void;
}

export class Shelf extends React.Component<ShelfProps, {}> {
  public render() {
    const positionShelves = ['x', 'y'].map(this.encodingShelf, this);
    const facetShelves = ['row', 'column'].map(this.encodingShelf, this);
    const otherShelves = ['size', 'color', 'shape', 'detail', 'text'].map(this.encodingShelf, this);

    return (
      <div className="shelf">
        <h2>Encoding</h2>
        {positionShelves}
        {facetShelves}

        <h3>Mark</h3>
        <MarkShelf
          mark={this.props.shelf.mark}
          onMarkChange={this.props.onMarkChange}
        />

        {otherShelves}
      </div>
    );
  }

  private encodingShelf(channel: Channel) {
    return (
      <EncodingShelf
        key={channel}
        channel={channel}
        fieldDef={{field: channel}}
      />
    );
  }
}


