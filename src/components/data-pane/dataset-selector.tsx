import * as React from 'react';

import {ActionHandler, datasetLoad, DatasetLoad, resultRequest} from '../../actions';
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

interface DatasetSelectorProps extends ActionHandler<DatasetLoad> {
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

  public componentDidUpdate() {
    this.props.handleAction(resultRequest());
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
    const name: string = event.target.value;
    const url: string = DATASET_INDEX[name].url;
    this.props.handleAction(datasetLoad(name, {url}));
  }
}
