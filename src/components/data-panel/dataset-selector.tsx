import * as React from 'react';

import {ShelfMark} from '../../models';

import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {PRIMITIVE_MARKS} from 'vega-lite/src/mark';
import {ActionHandler, datasetUrlLoad, DatasetUrlLoad} from '../../actions';
import {DEFAULT_DATASETS} from '../../constants';

const DATASET_INDEX = DEFAULT_DATASETS.reduce((index, dataset) => {
  index[dataset.name] = dataset;
  return index;
}, {});

const options = DEFAULT_DATASETS.map(dataset => (
  <option key={dataset.name} value={dataset.name}>
    {dataset.name}
  </option>
));

interface DatasetSelectorProps extends ActionHandler<DatasetUrlLoad> {
  name: string;
}

/**
 * Control for selecting mark type
 */
export class DatasetSelector extends React.PureComponent<DatasetSelectorProps, {}> {
  constructor(props: DatasetSelectorProps) {
    super(props);

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.onDatasetChange = this.onDatasetChange.bind(this);
  }

  public render() {
    return (
      <select
        className="DEFAULT_DATASETSelector"
        value={this.props.name}
        onChange={this.onDatasetChange}
      >
        {options}
      </select>
    );
  }
  private onDatasetChange(event: any) {
    const name = event.target.value;
    const url = DATASET_INDEX[name].url;
    this.props.handleAction(datasetUrlLoad(name, url));
  }
}
