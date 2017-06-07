import './app.scss';

import * as React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import {Dispatch} from 'redux';
import {StateWithHistory} from 'redux-undo';
import {Data} from 'vega-lite/build/src/data';
import {datasetLoad, SET_CONFIG} from '../actions';
import {StateBase} from '../models/index';

import {VoyagerConfig} from '../models/config';
import {DataPane} from './data-pane';
import {EncodingPane} from './encoding-pane';
import {Header} from './header';
import {ViewPane} from './view-pane';


export type VoyagerData = Data;

interface Props extends React.Props<AppBase> {
  config?: VoyagerConfig;
  data?: Data;
  dispatch: Dispatch<StateWithHistory<Readonly<StateBase>>>;
}

class AppBase extends React.PureComponent<Props, {}> {

  constructor(props: any) {
    super(props);
  }

  public componentWillUpdate(nextProps: Props) {
    this.update(nextProps);
  }

  public componentWillMount() {
    this.update(this.props);
  }

  public render() {
    return (
      <div className="voyager">
        <Header/>
        <SplitPane split="vertical" defaultSize={200}>
          <DataPane/>
          <SplitPane split="vertical" defaultSize={235}>
            <EncodingPane/>
            <ViewPane/>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }

  private update(props: Props) {
    const { data, config, dispatch } = props;
    if (data) {
      this.setData(data);
    }

    if (config) {
      this.setConfig(config);
    }
  }

  private setData(data: Data) {
    this.props.dispatch(datasetLoad("Custom Data", data));
  }

  private setConfig(config: VoyagerConfig) {
    this.props.dispatch({
      type: SET_CONFIG,
      payload: {
        config,
      }
    });
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);

