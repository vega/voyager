import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';

import * as styles from './data-pane.scss';

import {ActionHandler, createDispatchHandler, DatasetAsyncAction, ShelfFieldAutoAdd} from '../../actions';
import {Dataset, State} from '../../models';
import {VoyagerConfig} from '../../models/config';
import {DatasetSelector} from './dataset-selector';
import {FieldList, PresetWildcardFieldList} from './field-list';

export interface DataPanelProps extends ActionHandler<DatasetAsyncAction | ShelfFieldAutoAdd> {
  data: Dataset;
  config: VoyagerConfig;
}

export class DataPanelBase extends React.PureComponent<DataPanelProps, {}> {
  public render() {
    const {handleAction} = this.props;
    const {name} = this.props.data;
    const {showDataSourceSelector} = this.props.config;

    return (
      <div className="pane" styleName="data-pane">
        <h2>Data</h2>
        {showDataSourceSelector ? <DatasetSelector name={name} handleAction={handleAction}/> : undefined}
        <div>Name: {name}</div>

        <div styleName="data-pane-section">
          <h3>Fields</h3>
          <FieldList/>
        </div>

        <div styleName="data-pane-section">
          <h3>Wildcard Fields</h3>
          <PresetWildcardFieldList/>
        </div>
      </div>
    );
  }
}

export const DataPane = connect(
  (state: State) => {
    return {
      data: state.present.dataset,
      config: state.present.config
    };
  },
  createDispatchHandler<DatasetAsyncAction>()
)(CSSModules(DataPanelBase, styles));
