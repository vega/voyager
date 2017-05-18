import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import {Data, InlineData, isInlineData, isUrlData, UrlData} from 'vega-lite/build/src/data';

import {DataPane} from './data-pane';
import {EncodingPane} from './encoding-pane';
import {Header} from './header';
import {ViewPane} from './view-pane';

import {
  ActionHandler,
  DatasetAsyncAction,
  datasetUrlLoad,
} from '../actions';


export type VoyagerConfig = Object;
export type VoyagerData = InlineData | UrlData;

interface VoyagerAppProps extends ActionHandler<DatasetAsyncAction> {
  config: Object;
  data: Data;
  dispatch: any;
}

class AppBase extends React.PureComponent<VoyagerAppProps, {}> {

  constructor(props: any) {
    super(props);
  }

  public componentWillUpdate(nextProps: VoyagerAppProps) {
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

  private update(props: VoyagerAppProps) {
    const { data } = props;
    if (isUrlData(data)) {
      this.loadDataFromUrl(data);
    } else if (isInlineData(data)) {
      this.loadData(data);
    }
  }

  private loadData(data: InlineData) {
    // console.log('loadData: to be implemented: ', data);
  }

  private loadDataFromUrl(data: UrlData) {
    this.props.dispatch(datasetUrlLoad("Custom Data", data.url));
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);
