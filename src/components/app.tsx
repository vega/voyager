import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import {DataPane} from './data-pane';
import {EncodingPane} from './encoding-pane';
import {Header} from './header';
import {ViewPane} from './view-pane';

import {
  ActionHandler,
  DatasetAsyncAction,
  datasetUrlLoad,
} from '../actions';



interface DataURL {
  name: string;
  url: string;
};
export type VoyagerData = DataURL | Object[];
export type VoyagerConfig = Object;

interface VoyagerAppProps extends ActionHandler<DatasetAsyncAction> {
  config: Object;
  data: VoyagerData;
  dispatch: any;
}

class AppBase extends React.PureComponent<any, {}> {

  constructor(props: any) {
    super(props);
  }

  public componentWillUpdate(nextProps: any) {
    // console.log("App:componentWillUpdate");
    this.update();
  }

  public componentWillMount() {
    // console.log("App:componentWillMount");
    this.update();
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

  private update(){
    const { data } = this.props;
    if (typeof data === "object" && data !== null) {
      this.loadDataFromUrl(data.name, data.url);
    } else if (Array.isArray(data)) {
      this.loadData(data);
    }
  }

  private loadData(data: Object[]) {
    console.log('loadData: to be implemented: ', data);
  }

  private loadDataFromUrl(name: string, url: string) {
    this.props.dispatch(datasetUrlLoad(name, url));
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);
