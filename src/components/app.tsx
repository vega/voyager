import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import { Dispatch } from 'redux';
import { StateWithHistory } from 'redux-undo';
import {Data, InlineData, isInlineData, isUrlData, UrlData} from 'vega-lite/build/src/data';
import { datasetUrlLoad } from '../actions';
import { StateBase } from '../models/index';

import {DataPane} from './data-pane';
import {EncodingPane} from './encoding-pane';
import {Header} from './header';
import {ViewPane} from './view-pane';


export type VoyagerConfig = Object;
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
    const {data} = props;
    if (data) {
      if (isUrlData(data)) {
        this.loadDataFromUrl(data);
      } else if (isInlineData(data)) {
        this.loadData(data);
      }
    }
  }

  private loadData(data: InlineData) {
    // tslint:disable-next-line:no-console
    console.log('loadData: to be implemented: ', data);
  }

  private loadDataFromUrl(data: UrlData) {
    if (this.props.dispatch) {
      this.props.dispatch(datasetUrlLoad("Custom Data", data.url));
    }
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);

