import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import {DataPanel} from './data-panel';
import {EncodingPanel} from './encoding-panel';
import {Header} from './header';
import {ViewPanel} from './view-panel';


class AppBase extends React.PureComponent<any, {}> {
  public render() {
    return (
      <div className="voyager">
        <Header/>
        <SplitPane split="vertical" defaultSize={250}>
          <DataPanel/>
          <SplitPane split="vertical" defaultSize={235}>
            <EncodingPanel/>
            <ViewPanel/>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);
