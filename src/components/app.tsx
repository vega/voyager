import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import { data as VegaLiteData } from 'vega-lite';

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
export type VoyagerData = VegaLiteData.InlineData | VegaLiteData.UrlData;

interface VoyagerAppProps extends ActionHandler<DatasetAsyncAction> {
  config: Object;
  data: VegaLiteData.Data;
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

  private update() {
    const { data } = this.props;
    if (VegaLiteData.isUrlData) {
      this.loadDataFromUrl(data);
    } else if (VegaLiteData.isInlineData) {
      this.loadData(data);
    }
  }



  private loadData(data: VegaLiteData.InlineData) {
    // console.log('loadData: to be implemented: ', data);
  }

  private loadDataFromUrl(data: VegaLiteData.UrlData) {
    this.props.dispatch(datasetUrlLoad("Custom Data", data.url));
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);
