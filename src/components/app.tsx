import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import {DataPane} from './data-pane';
import {EncodingPane} from './encoding-pane';
import {Header} from './header';
import {ViewPane} from './view-pane';

import {connect} from 'react-redux';
import {State} from '../models';
import {
  createDispatchHandler,
  datasetUrlLoad,
  ActionHandler,
  DatasetAsyncAction,
} from '../actions';

export type VoyagerData = string | Object[];
export type VoyagerConfig = Object;

interface VoyagerAppProps extends ActionHandler<DatasetAsyncAction> {
  config: Object;
  data: VoyagerData;
}

class AppBase extends React.PureComponent<ActionHandler, {}> {
  constructor(props: any) {
    super(props);
  }

  public componentWillUpdate(nextProps: any) {
    console.log("APP, componentWillUpdate", nextProps);
  }

  public componentWillMount(nextProps: any) {
    console.log("APP, componenWillMount", nextProps, this.props);
    this.onDatasetChange("Custom", this.props.data);
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

  private onDatasetChange(name: any, url: any) {
    this.props.handleAction(datasetUrlLoad(name, url));
  }
}

// This is what i am trying to get to to work. so that onDatasetChange will
// work
export const App = connect(
  (state: State) => state,
  createDispatchHandler<DatasetAsyncAction>()
)(DragDropContext(HTML5Backend)(AppBase));

export const App = DragDropContext(HTML5Backend)(AppBase);
